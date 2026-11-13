> **Editorial source batch — preserved verbatim as supplied. Not converted to
> repository TypeScript. No article here is published.**
>
> Supplied: 2026-08-28. Contains **1 article** (Article 1) of an expected
> several; the remainder had not arrived when this file was written.
>
> Blocking issues to resolve before any conversion — see
> `docs/editorial/qwen-batch-019.refined.md` for the full assessment:
>
> 1. `category: "Infrastructure"` is not a category in this repository.
> 2. Substantial overlap with the published `linux-xdp-vs-tc-ebpf-packet-drop`.

---

Article 1

```yaml
slug: "linux-ebpf-xdp-vs-dpdk-packet-processing"
title: "XDP vs. DPDK: Architectural Mechanics, Kernel Bypass Trade-offs, and Memory Semantics"
category: "Infrastructure"
subcategory: "Networking"
description: "A technical evaluation of eXpress Data Path (XDP) and Data Plane Development Kit (DPDK) for low-latency packet processing, comparing kernel integration, zero-copy mechanics, memory safety, and operational overhead."
primaryKeyword: "XDP vs DPDK packet processing"
draft: true
```

## Navigating the High-Throughput Packet Path

Modern line-rate packet processing at 100 GbE and beyond exposes the fundamental CPU limits of the standard Linux network stack. Traversing sk_buff allocation, socket buffers, softirq scheduling, and netfilter hooks incurs substantial per-packet overhead. To handle line-rate workloads, infrastructure engineers typically evaluate two primary paradigms: eXpress Data Path (XDP) and Data Plane Development Kit (DPDK).

DPDK bypasses the kernel entirely, granting userspace applications direct, polled access to network interface card (NIC) rings. In contrast, XDP operates inside the Linux kernel driver layer, running sandboxed Extended Berkeley Packet Filter (eBPF) bytecode directly on raw packet memory before the kernel allocates an sk_buff.

This article analyzes the architectural mechanics, memory models, hardware dependencies, and operational trade-offs of both frameworks.

## Architectural Mechanics: Kernel-Integrated vs. Kernel-Bypass

### DPDK: Userspace Polling and Complete Bypass

DPDK decouples the network adapter from the Linux kernel network driver. By binding the interface to userspace drivers via vfio-pci or uio_pci_generic, DPDK shifts all control and data plane duties to a userspace runtime.

```
+-------------------------------------------------------------+
|                      DPDK Application                       |
|   (Poll Mode Driver, rte_mempool, rte_ring, Worker Cores)   |
+-------------------------------------------------------------+
                              ^
                              | Userspace MMIO / DMA Buffers
                              v
+-------------------------------------------------------------+
|                   Hardware NIC (PCIe Pass)                  |
+-------------------------------------------------------------+
```

- **Poll Mode Drivers (PMD):** Instead of relying on hardware interrupts, DPDK uses continuous polling threads on dedicated CPU cores. This eliminates interrupt handling overhead and context switching.
- **Memory Management (rte_mempool and rte_ring):** DPDK allocates lockless ring buffers backed by Linux Hugepages (2 MB or 1 GB pages). This setup minimizes Translation Lookaside Buffer (TLB) misses.
- **Loss of Native Tools:** Because the kernel network subsystem never sees the traffic, standard tools such as iptables, nftables, tcpdump, iproute2, and native routing daemons cannot interact with DPDK-bound interfaces directly.

### XDP: In-Kernel Driver Hook with eBPF

XDP executes sandboxed eBPF bytecode at the lowest possible software level inside the network driver subsystem. The hook triggers immediately upon NIC ring buffer reception, before memory is converted to an sk_buff.

```
+-------------------------------------------------------------+
|                 Linux Kernel Network Stack                  |
|             (TCP/IP, Netfilter, Sockets, sk_buff)           |
+-------------------------------------------------------------+
                              ^
                              | XDP_PASS
+-------------------------------------------------------------+
|                     XDP Driver Hook                         |
|    - Runs eBPF Bytecode on raw xdp_buff                     |
|    - Actions: XDP_DROP, XDP_TX, XDP_REDIRECT, XDP_PASS      |
+-------------------------------------------------------------+
                              ^
                              | Raw DMA RX Ring
+-------------------------------------------------------------+
|                        Hardware NIC                         |
+-------------------------------------------------------------+
```

XDP programs inspect a lightweight context struct (struct xdp_buff or struct xdp_md) and return one of five deterministic verdicts:

- **XDP_DROP:** Discards the packet immediately, releasing the RX descriptor directly back to the ring.
- **XDP_TX:** Bounces the packet back out the same network interface that received it.
- **XDP_REDIRECT:** Routes the packet to another NIC, a CPU core, an AF_XDP userspace socket, or a virtual interface (e.g., veth).
- **XDP_PASS:** Pushes the packet up into the standard Linux networking stack, allocating an sk_buff.
- **XDP_ABORTED:** Halts processing due to an eBPF program error and logs an operational tracepoint.

## Memory Models: rte_mbuf vs. xdp_buff / UMEM

Memory allocation and buffer lifecycles dictate packet processing throughput and latency.

```
+-------------------------------------------------------------------------+
|                  DPDK rte_mbuf Memory Model                             |
|  +----------------+----------------+---------------------------------+  |
|  | rte_mbuf Head  | Headroom       | Packet Data Payload             |  |
|  | (Metadata)     | (RTE_PKTMBUF_  | (Direct DMA Target)             |  |
|  |                |  HEADROOM)     |                                 |  |
|  +----------------+----------------+---------------------------------+  |
+-------------------------------------------------------------------------+

+-------------------------------------------------------------------------+
|                   XDP / AF_XDP (UMEM) Model                             |
|  +----------------+--------------------------------------------------+  |
|  | XDP Headroom   | Packet Data (data -> data_end)                   |  |
|  | (Frame Offset) | (Single Contiguous Memory Block in Page Pool)    |  |
|  +----------------+--------------------------------------------------+  |
+-------------------------------------------------------------------------+
```

### The DPDK rte_mbuf Architecture

DPDK provisions pre-allocated memory pools (rte_mempool) mapped directly into hugepages. Every packet lives in an rte_mbuf structure:

- Includes metadata fields (packet length, packet type, offload flags, port identifiers).
- Contains a fixed headroom (typically configured via RTE_PKTMBUF_HEADROOM, commonly 128 bytes) allowing protocols to prepend headers without memory reallocations.
- Reclaiming memory requires explicit programmatic calls to return descriptors back to the rte_mempool. If a developer leaks an rte_mbuf, the RX pool starves, leading to hardware ring drops.

### The XDP Page Pool and AF_XDP (XSK) UMEM

XDP avoids memory allocation paths entirely by operating directly on the physical memory pages populated by the NIC's Direct Memory Access (DMA) engine:

- The driver's page pool supplies pre-allocated pages directly to the NIC ring.
- If redirected to userspace via AF_XDP, packets transition through a shared user-kernel memory region called UMEM.

The UMEM architecture relies on four lockless ring queues:

- **Fill Ring:** Userspace provides addresses of empty memory frames to the kernel for DMA writes.
- **RX Ring:** The kernel notifies userspace of received frames ready for processing.
- **TX Ring:** Userspace posts outgoing packet frames to be sent by the driver.
- **Completion Ring:** The kernel notifies userspace that transmitted frames have cleared the hardware queue.

## Zero-Copy Mechanics and Hardware Requirements

Achieving true zero-copy processing requires explicit alignment between driver implementations and physical ring buffers.

```
+---------------------------------------------------------------------------+
|                          AF_XDP Zero-Copy Mode                            |
|                                                                           |
|   +-------------------+                     +-------------------------+   |
|   |   Userspace App   | <=== Shared UMEM => | Driver RX/TX Rings      |   |
|   |   (Process Data)  |    (No Memcpy)      | (NIC Direct DMA Target) |   |
|   +-------------------+                     +-------------------------+   |
+---------------------------------------------------------------------------+

+---------------------------------------------------------------------------+
|                          AF_XDP Copy-Mode (Fallback)                      |
|                                                                           |
|   +-------------------+      memcpy()       +-------------------------+   |
|   |   Userspace App   | <================== | Kernel Driver Buffer    |   |
|   |   (UMEM Copy)     |                     | (sk_buff / Page Pool)   |   |
|   +-------------------+                     +-------------------------+   |
+---------------------------------------------------------------------------+
```

### XDP Operating Modes

XDP operates in one of three functional modes:

- **Offloaded (xdp_offload):** The eBPF program is compiled into native NPU instruction sets and executed entirely on SmartNIC silicon (e.g., supported Netronome or Marvell adapters). Zero CPU core cycles are consumed.
- **Native / Driver (xdp_drv):** The eBPF program runs directly in the main driver RX loop before sk_buff creation. Requires explicit network driver support (e.g., mlx5, ixgbe, i40e, virtio_net).
- **Generic (xdp_generic):** Runs after the kernel network subsystem allocates the sk_buff. This mode serves as a fallback for drivers lacking native XDP support, though it loses the performance benefits of early execution.

### AF_XDP Zero-Copy Configuration Constraints

To run AF_XDP in zero-copy mode (XDP_ZEROCOPY), the system must satisfy strict conditions:

- The underlying driver must implement explicit AF_XDP Zero-Copy support (implementing ndo_bpf and ndo_xsk_wakeup).
- UMEM memory chunk alignments must match the buffer stride sizes required by the physical NIC descriptor layout.
- If these prerequisites are not met, socket initialization falls back to XDP_COPY mode, incurring a copy between kernel driver buffers and userspace memory frames.

## Engineering Comparison

| Technical Dimension | DPDK (Data Plane Development Kit) | XDP (eXpress Data Path) & AF_XDP |
|---|---|---|
| Execution Domain | Userspace | Kernel Driver Space / Userspace (AF_XDP) |
| Kernel Stack Integration | None (Complete Bypass) | Seamless selective fallback (XDP_PASS) |
| Driver Model | Dedicated Poll Mode Drivers (PMD) | Native Linux Network Drivers |
| Memory Isolation | Standard userspace memory protection | Kernel eBPF Verifier validation |
| Hardware Core Allocation | 100% Dedicated Core Pinning (Spin-polling) | Interrupt-driven, Polled (NAPI), or Busy-polling |
| Tooling & Visibility | Custom DPDK metrics, isolated from OS | bpftool, iproute2, tracepoints, tcpdump |
| Crash Blast Radius | App crash drops interface processing | Faults isolated; kernel verifier guards bugs |
| Control Plane Complexity | High (must re-implement or bridge routing) | Low (uses native Linux IP routing/FIB tables) |

## Minimal Implementation Examples

### Minimal XDP Kernel Program: Selective Filtering and Counter

The following C program compiles to eBPF bytecode via LLVM/Clang. It inspects Ethernet frame headers, drops UDP packets destined for a target port, and allows all other traffic to enter the Linux network stack.

```c
#include <linux/bpf.h>
#include <linux/if_ether.h>
#include <linux/ip.h>
#include <linux/udp.h>
#include <linux/in.h>
#include <bpf/bpf_helpers.h>
#include <bpf/bpf_endian.h>

#define TARGET_UDP_PORT 9000

SEC("xdp")
int xdp_filter_udp_port(struct xdp_md *ctx) {
    void *data_end = (void *)(long)ctx->data_end;
    void *data = (void *)(long)ctx->data;

    // Boundary check: Ethernet Header
    struct ethhdr *eth = data;
    if ((void *)(eth + 1) > data_end) {
        return XDP_PASS;
    }
    if (eth->h_proto != bpf_htons(ETH_P_IP)) {
        return XDP_PASS;
    }

    // Boundary check: IPv4 Header
    struct iphdr *iph = (void *)(eth + 1);
    if ((void *)(iph + 1) > data_end) {
        return XDP_PASS;
    }

    // Process only UDP
    if (iph->protocol != IPPROTO_UDP) {
        return XDP_PASS;
    }

    // Variable IP header length calculation
    int ip_hdr_len = iph->ihl * 4;
    if (ip_hdr_len < sizeof(struct iphdr)) {
        return XDP_DROP;
    }

    struct udphdr *udph = (void *)((char *)iph + ip_hdr_len);
    if ((void *)(udph + 1) > data_end) {
        return XDP_PASS;
    }

    // Inspect destination port
    if (udph->dest == bpf_htons(TARGET_UDP_PORT)) {
        return XDP_DROP;
    }

    return XDP_PASS;
}

char _license[] SEC("license") = "GPL";
```

### Minimal DPDK Packet Polling Loop

The following snippet demonstrates the core execution loop of a DPDK thread polling an Ethernet port via Poll Mode Drivers.

```c
#include <rte_eal.h>
#include <rte_ethdev.h>
#include <rte_mbuf.h>

#define BURST_SIZE 32
#define PREFETCH_OFFSET 3

void dpdk_processing_loop(uint16_t port_id, uint16_t queue_id) {
    struct rte_mbuf *pkts_burst[BURST_SIZE];

    while (1) {
        // Poll RX ring for packet burst
        const uint16_t nb_rx = rte_eth_rx_burst(port_id, queue_id, pkts_burst, BURST_SIZE);
        if (nb_rx == 0) {
            continue;
        }

        for (uint16_t i = 0; i < nb_rx; i++) {
            struct rte_mbuf *m = pkts_burst[i];

            // Prefetch packet payload to CPU L1/L2 cache
            if (i + PREFETCH_OFFSET < nb_rx) {
                rte_prefetch0(rte_pktmbuf_mtod(pkts_burst[i + PREFETCH_OFFSET], void *));
            }

            // Inspect or transform packet data
            uint8_t *packet_data = rte_pktmbuf_mtod(m, uint8_t *);

            // Release mbuf descriptor back to the pool
            rte_pktmbuf_free(m);
        }
    }
}
```

## Failure Modes and Operational Constraints

### 1. Blast Radius and System Stability

- **DPDK Failure Scenarios:** DPDK applications run with elevated direct-memory mapping privileges. A memory corruption bug, segmentation fault, or wild pointer dereference terminates the entire userspace network process. The NIC stops handling traffic until the process restarts and re-initializes PCIe hardware registers.
- **XDP Failure Scenarios:** The kernel's static eBPF verifier enforces rigorous safety checks at program load time. It rejects programs containing out-of-bounds pointer arithmetic, uninitialized memory accesses, or unbounded loops. A runtime issue in an XDP program cannot crash the underlying kernel. At worst, an unhandled execution path falls back to XDP_ABORTED.

### 2. Resource Allocation and Core Saturation

- **DPDK CPU Utilization:** DPDK Poll Mode Drivers pin dedicated CPU cores at 100% load, regardless of whether traffic is flowing. To optimize power and CPU utilization, engineers must implement DPDK power management libraries (such as rte_power) that rely on interrupt fallbacks during idle periods.
- **XDP Workload Scaling:** Native XDP utilizes the Linux kernel's standard NAPI processing loop. If there is no incoming traffic, CPU cores remain idle. When loaded, XDP scales dynamically across available hardware RX/TX queues using Receive Side Scaling (RSS).

### 3. Control Plane Integration and Ecosystem Friction

- **DPDK Isolation:** Moving packet processing to DPDK bypasses the kernel's routing tables, ARP resolution, and security groups. Deploying a DPDK application typically requires maintaining a custom control plane or integrating third-party stacks (e.g., FD.io VPP) to manage basic layer-2 and layer-3 forwarding logic.
- **XDP Coexistence:** XDP programs can query kernel routing tables directly via helper functions like bpf_fib_lookup(). This allows programs to route or drop traffic at early ingress, while forwarding valid control-plane packets (such as BGP or ARP) to the standard Linux stack via XDP_PASS.

## Engineering Synthesis: Decision Matrix

```
                          Line-Rate Processing Requirements
                                          |
        +---------------------------------+---------------------------------+
        |                                                                   |
Must control physical NIC directly                               Requires Linux stack integration,
or run on non-Linux platform?                                    standard tooling, or shared routing?
        |                                                                   |
        v                                                                   v
+------------------+                                              +-------------------+
|    Use DPDK      |                                              |      Use XDP      |
|                  |                                              |                   |
| - Custom ASICs   |                                              | - DDoS Mitigation |
| - Telecom NFV    |                                              | - Cloud L4 LB     |
| - Standalone VPP |                                              | - Container Mesh  |
+------------------+                                              +-------------------+
```

**When to Deploy DPDK:**

- The application runs on systems where Linux driver infrastructure cannot be modified or where proprietary operating systems require a unified abstraction layer.
- The system architecture relies entirely on dedicated compute cores designed for constant, deterministic line-rate polling without operating system scheduling jitter.
- The processing pipeline leverages custom userspace network stacks (such as telecom NFV appliances or dedicated DPI middleboxes) that implement custom layer-2 through layer-7 protocols.

**When to Deploy XDP / AF_XDP:**

- The system requires high-throughput packet filtering (e.g., edge DDoS mitigation) while maintaining access to standard host monitoring tools (ss, bpftool, tcpdump).
- The application serves as a layer-4 load balancer (e.g., Katran) that routes traffic using the host kernel's existing Forwarding Information Base (FIB).
- High-throughput userspace ingestion is needed via AF_XDP, but the network infrastructure still relies on native Linux security frameworks, IPsec endpoints, and standard container networking interfaces (CNIs).

## Authoritative Technical References

- Linux Kernel Documentation: eXpress Data Path (XDP) & BPF Documentation. https://docs.kernel.org/networking/af_xdp.html
- DPDK Project Specification: Data Plane Development Kit Documentation & Programmer's Guide. https://doc.dpdk.org/guides/prog_guide/
- IETF RFC 791 / RFC 8200: Internet Protocol Standards and Header Specifications. https://www.rfc-editor.org/
