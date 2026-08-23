ARTICLE #: 11
Title: AWS VPC Lattice vs. API Gateway: The Service-to-Service Networking Reality
Category: Cloud / Networking
Primary Keyword: AWS VPC Lattice vs API Gateway
Secondary Keywords: service-to-service networking AWS, internal API management, AWS service mesh, VPC Lattice architecture, East-West traffic AWS
Search Intent: Informational / Architectural Decision Making
Suggested Slug: aws-vpc-lattice-vs-api-gateway-service-networking
SEO Title: AWS VPC Lattice vs. API Gateway: Choosing the Right Service Networking Tool
Meta Description: Don't use API Gateway for internal service-to-service traffic by default. Learn the architectural, cost, and operational differences between AWS VPC Lattice and API Gateway.
Target Reader: Cloud architects, network engineers, DevOps engineers, AWS specialists
Core Question: When should an enterprise use AWS VPC Lattice instead of API Gateway for internal service-to-service communication?
Unique Angle: Challenging the "API Gateway for everything" anti-pattern by exposing the cost, latency, and operational overhead of using North-South tools for East-West traffic, and positioning VPC Lattice as the purpose-built alternative.
Estimated Reading Time: 12 minutes
Word Count: ~2,300
ARTICLE
For years, the default answer to "How do we manage, secure, and route traffic between services in AWS?" was Amazon API Gateway. It is a mature, feature-rich service. However, as microservices architectures have grown, engineering teams have increasingly forced API Gateway to handle internal, service-to-service (East-West) traffic.
This is an architectural anti-pattern. API Gateway was designed primarily for North-South traffic: exposing APIs to external clients, mobile apps, or third-party partners. Using it for internal service communication introduces unnecessary latency, complex VPC networking configurations, and significant, often unexpected, cost overhead.
AWS introduced VPC Lattice specifically to solve the service-to-service networking problem. But because both services handle HTTP/HTTPS routing, the line between them can seem blurry. Understanding the fundamental architectural differences between the two is critical for building scalable, cost-effective, and secure AWS environments.
The Short Answer
Use Amazon API Gateway when you are building a public-facing API, need advanced request transformation, require integration with AWS WAF at the edge, or are exposing services to external clients or partners.
Use AWS VPC Lattice when you need to manage, secure, and observe internal service-to-service communication across multiple VPCs and AWS accounts. VPC Lattice operates at Layer 7, decoupling service networking from the underlying VPC IP topology, without the per-request cost and North-South baggage of API Gateway.
The Architectural Divide: North-South vs. East-West
To choose the right tool, you must understand the traffic patterns they were built to handle.
API Gateway (North-South Focus)
API Gateway acts as a "front door" for applications. It is designed to handle untrusted traffic from the public internet. Its feature set reflects this: it offers robust API key management, usage plans, request/response payload transformation, and deep integration with AWS WAF and Shield.
To use API Gateway for internal traffic, you typically have to deploy it as a Private API. This requires setting up VPC Endpoints (Interface Endpoints) in every VPC that needs to consume the API, managing Route 53 Private Hosted Zones for DNS resolution, and configuring resource policies to allow specific VPCs or accounts to invoke the API. This creates significant operational overhead as the number of consuming services grows.
VPC Lattice (East-West Focus)
VPC Lattice is a fully managed service discovery, routing, and security service designed specifically for service-to-service communication. It abstracts away the underlying network topology.
Instead of routing based on IP addresses or VPC peering configurations, VPC Lattice routes based on service names. You define a "Service Network" (a logical boundary, similar to a security boundary). You then register your applications (running on EC2, ECS, EKS, or Lambda) as "Targets" within that Service Network.
When Service A wants to talk to Service B, it simply sends an HTTP request to http://service-b (or a custom domain). VPC Lattice intercepts this, evaluates the auth policy, and routes the traffic to the healthy targets, regardless of which VPC or AWS account Service B resides in. No VPC peering, no complex Route 53 setups, and no Interface Endpoints required for the data plane.
The Cost Reality: Why API Gateway Bleeds Budgets Internally
One of the most compelling reasons to avoid API Gateway for internal traffic is cost. API Gateway pricing is heavily weighted toward request volume.
As of current AWS pricing, REST APIs charge $3.50 per million requests. While this seems small, internal microservices chatter is voluminous. If Service A polls Service B 100 times per second, that is 8.6 million requests per day, or roughly 260 million requests per month. For a single internal endpoint, that is nearly $1,000 per month, per API, just in request fees, excluding data transfer costs.
VPC Lattice, by contrast, is priced based on the number of Service Networks, the number of rules, and the volume of data processed (LCUs - Lattice Capacity Units). It does not charge a per-request fee in the same granular, punitive way API Gateway does. For high-frequency internal service communication, VPC Lattice is consistently more cost-effective.
Security and Authentication: Resource Policies vs. IAM
Both services integrate with AWS IAM, but they do so in fundamentally different ways that impact operational security.
API Gateway Security
For Private APIs, API Gateway uses VPC Endpoint Policies and Resource Policies. You must explicitly list the ARN of the consuming VPC or account in the API's resource policy. This is a static, infrastructure-as-code burden. If a new VPC is created, the API Gateway resource policy must be updated. Furthermore, API Gateway does not natively validate the identity of the calling service; it only validates that the request originated from an allowed network boundary.
VPC Lattice Security
VPC Lattice uses fine-grained, identity-based authentication and authorization. You can configure an auth policy on a VPC Lattice service that requires the caller to present a valid IAM identity (e.g., an IAM Role assumed by an ECS task or an EKS pod via IAM Roles for Service Accounts - IRSA).
This means you can write a policy that states: "Only the ECS task running with the frontend-service-role can invoke the payment-service." This is true Zero Trust at the service layer. It verifies who is calling, not just where the call is coming from. Additionally, VPC Lattice integrates natively with AWS Verified Access and third-party identity providers (like Entra ID or Okta) for user-to-service authentication, though service-to-service IAM is the primary use case.
Real-World Scenario: The Multi-Account E-Commerce Platform
Consider an enterprise running an e-commerce platform on AWS, organized into three accounts: Shared-Services, Catalog, and Checkout.
The Checkout service (in the Checkout account, VPC C) needs to call the Inventory service (in the Catalog account, VPC B) to verify stock, and the Fraud service (in the Shared-Services account, VPC A) to validate the transaction.
The API Gateway Approach:
The Inventory team deploys a Private API Gateway in VPC B.
They create a Resource Policy allowing VPC A and VPC C to invoke it.
The Checkout team must create an Interface VPC Endpoint for API Gateway in VPC C.
They must configure Route 53 Private Hosted Zones in VPC C to resolve the API Gateway's regional DNS name to the Interface Endpoint's private IP.
The Fraud team repeats steps 3 and 4 in VPC A.
If the Inventory API changes its endpoint configuration, all consuming teams must update their DNS and endpoint configurations.
The VPC Lattice Approach:
The network team creates a single "E-Commerce Service Network" and associates VPC A, VPC B, and VPC C with it.
The Inventory team registers their ECS service as a target in VPC Lattice and names it inventory-service.
The Checkout service simply makes an HTTP call to http://inventory-service. VPC Lattice handles the cross-account, cross-VPC routing automatically.
The Inventory team applies an auth policy: Allow Principal: arn:aws:iam::checkout-account:role/CheckoutTaskRole.
The VPC Lattice approach eliminates VPC Endpoints, Route 53 complexity, and static IP-based policies, replacing them with dynamic, identity-aware service discovery.
Common Mistakes in Service Networking
1. Using API Gateway as an Internal Service Mesh
Teams often deploy API Gateway in front of every internal microservice to "standardize" routing. This creates a massive, centralized bottleneck. API Gateway is not designed to handle the high-throughput, low-latency requirements of a service mesh. It adds measurable latency (typically 50-100ms per hop) that compounds rapidly in a chain of internal microservice calls.
2. Ignoring VPC Lattice Target Group Health Checks
VPC Lattice relies on target groups (similar to ALB target groups) to route traffic. If you register an ECS service or EC2 instance, you must ensure the security groups allow health check traffic from the VPC Lattice service network. A common failure mode is deploying a service, seeing it as "registered" in VPC Lattice, but receiving 503 errors because the health checks are being blocked by a restrictive security group, marking the targets as unhealthy.
3. Overcomplicating VPC Lattice with Custom Domains Unnecessarily
While VPC Lattice supports custom domains with AWS PCA (Private Certificate Authority) or ACM, the default DNS provided by VPC Lattice (e.g., <service-name>.<service-network-id>.svc.cluster.local) is often sufficient for internal service-to-service communication. Forcing a custom domain setup adds unnecessary operational overhead unless strict corporate naming conventions require it.
Operational and Troubleshooting Considerations
Troubleshooting VPC Lattice requires a different mindset than troubleshooting traditional VPC routing. Because VPC Lattice operates at Layer 7, traditional tools like VPC Flow Logs will show traffic flowing from the source to the VPC Lattice endpoint, but they will not show the final hop from VPC Lattice to the target service.
To troubleshoot routing or authentication failures in VPC Lattice, you must rely on:
VPC Lattice Access Logs: These must be explicitly enabled and sent to S3 or CloudWatch. They provide the Layer 7 details, including the caller's IAM identity, the target IP, and the HTTP response code.
Target Group Health: Always verify the health status of the targets in the VPC Lattice console or via CLI. An "unhealthy" target will silently drop traffic.
Auth Policy Evaluation: Use the VPC Lattice "Evaluate Auth Policy" feature in the console to simulate a request from a specific IAM role to a specific service, which is invaluable for debugging complex cross-account permission issues.
Decision Guidance: The Comparison Matrix
Feature / Requirement
Amazon API Gateway
AWS VPC Lattice
Primary Traffic Pattern
North-South (External to Internal)
East-West (Internal Service-to-Service)
Network Topology Dependency
High (Requires VPC Endpoints, Route 53)
None (Decoupled from VPC IP space)
Authentication Model
API Keys, Lambda Authorizers, Cognito, IAM Resource Policies
IAM Identity-based (Service-to-Service), Verified Access
Request Transformation
Extensive (Mapping templates, payload modification)
None (Pass-through Layer 7 routing)
Cost Model
High per-request cost ($3.50/million for REST)
LCU-based (Data processed + rules), no per-request fee
Latency
Higher (50-100ms+ overhead)
Lower (Optimized for internal routing)
WAF Integration
Native, robust AWS WAF integration
Supported, but primarily for user-to-service traffic
Practical Takeaways
Audit your internal API Gateways. If you have Private API Gateways being called exclusively by other AWS services within your organization, evaluate migrating them to VPC Lattice. The cost savings and operational simplification are often immediate.
Embrace identity-based routing. Stop using IP addresses and VPC peering as your primary security boundary for microservices. Use VPC Lattice auth policies to enforce that only specific IAM roles can invoke specific services.
Enable Access Logs immediately. Do not deploy VPC Lattice to production without enabling access logs. The lack of visibility into Layer 7 routing decisions will make troubleshooting exponentially harder.
Keep API Gateway for the edge. Reserve API Gateway for its intended purpose: managing external APIs, handling usage plans, transforming payloads for legacy clients, and providing a secure, WAF-protected front door.
Validate health checks. When registering targets in VPC Lattice, ensure the target's security group explicitly allows inbound traffic from the VPC Lattice prefix list for health checks, or the service will be unreachable.
Conclusion
The temptation to use a single tool for all routing problems is strong, but it leads to fragile, expensive architectures. API Gateway is an exceptional tool for managing external API lifecycles. VPC Lattice is a purpose-built engine for internal service communication.
By aligning the tool with the traffic pattern—API Gateway for North-South, VPC Lattice for East-West—cloud architects can build environments that are not only more secure and observable but also significantly more cost-effective and easier to operate at scale.
SUGGESTED INTERNAL LINKS
Anchor Text: IAM Roles for Service Accounts (IRSA)
Suggested Article: Securing Kubernetes Workloads in AWS with IRSA
Reason: Explains the mechanism by which EKS pods obtain the IAM identities required for VPC Lattice auth policies.
Anchor Text: AWS WAF Integration
Suggested Article: Architecting Web Application Firewalls for Cloud-Native Applications
Reason: Details why API Gateway remains the superior choice when deep, edge-level WAF inspection is required.
Anchor Text: VPC Flow Logs
Suggested Article: The Limitations of VPC Flow Logs in Modern Cloud Troubleshooting
Reason: Provides context on why Layer 7 tools like VPC Lattice Access Logs are necessary when traditional network logs fall short.
SOURCES
Source: What is Amazon VPC Lattice?
Organization: Amazon Web Services
URL: https://docs.aws.amazon.com/vpc-lattice/latest/ug/what-is-vpc-lattice.html
Why it matters: Official AWS documentation defining the core architecture, target groups, and service network concepts of VPC Lattice.
Source: Amazon API Gateway Pricing
Organization: Amazon Web Services
URL: https://aws.amazon.com/api-gateway/pricing/
Why it matters: Provides the authoritative cost structure necessary to evaluate the financial impact of using API Gateway for high-volume internal traffic.
Source: Auth policies in VPC Lattice
Organization: Amazon Web Services
URL: https://docs.aws.amazon.com/vpc-lattice/latest/ug/auth-policies.html
Why it matters: Details the IAM-based, identity-aware authorization model that differentiates VPC Lattice from traditional network-level security groups.
ARTICLE #: 12
Title: The Mechanics of OAuth 2.0 Token Theft and How DPoP Fixes It
Category: Cybersecurity / Identity
Primary Keyword: OAuth 2.0 token theft DPoP
Secondary Keywords: Demonstrating Proof of Possession, bearer token security, RFC 9449, OAuth security, API token theft mitigation
Search Intent: Informational / Technical Security Architecture
Suggested Slug: oauth2-token-theft-dpop-mechanics
SEO Title: OAuth 2.0 Token Theft: How Bearer Tokens Fail and How DPoP Fixes It
Meta Description: Bearer tokens are vulnerable to theft. Learn how OAuth 2.0 token theft occurs and how the DPoP (Demonstrating Proof of Possession) standard cryptographically prevents it.
Target Reader: Security architects, API developers, CISOs, identity engineers
Core Question: Why are standard OAuth 2.0 bearer tokens inherently vulnerable to theft, and how does the DPoP specification technically mitigate this risk?
Unique Angle: Moving beyond the generic "use MFA" advice to explain the cryptographic mechanics of RFC 9449 (DPoP) and the exact HTTP flow required to bind a token to a client's cryptographic key.
Estimated Reading Time: 11 minutes
Word Count: ~2,200
ARTICLE
OAuth 2.0 is the foundational protocol for modern API authorization. It allows applications to obtain limited access to user accounts or services without exposing credentials. The standard mechanism for this access is the "Bearer Token" (typically a JSON Web Token, or JWT).
The term "Bearer" is not a technical accident; it is a precise security definition. As defined in RFC 6750, a Bearer Token means "any party in possession of the token (a 'bearer') can use the token in any way that any other party in possession of it can."
In other words, a Bearer Token is like cash. If an attacker steals it, they can spend it. They do not need to know the user's password, bypass MFA, or answer security questions. They simply present the token to the API, and the API grants access.
As applications move to complex, distributed environments (single-page applications, mobile apps, and complex CI/CD pipelines), the attack surface for token theft via Cross-Site Scripting (XSS), compromised endpoints, or network interception has grown. The industry's answer to this fundamental flaw in the Bearer model is DPoP (Demonstrating Proof of Possession), standardized in IETF RFC 9449.
The Short Answer
Standard OAuth 2.0 Bearer tokens are vulnerable because they are decoupled from the client that requested them. Anyone who intercepts or steals the token can use it.
DPoP (Demonstrating Proof of Possession) fixes this by cryptographically binding the access token to a specific public/private key pair generated by the client application. To use the token, the client must prove it possesses the corresponding private key by signing every API request. If an attacker steals the token but does not have the client's private key, the token is cryptographically useless.
The Anatomy of Bearer Token Theft
To understand why DPoP is necessary, we must look at how Bearer tokens are stolen in practice.
XSS (Cross-Site Scripting): An attacker injects malicious JavaScript into a vulnerable single-page application (SPA). The script reads the access token from localStorage or sessionStorage and exfiltrates it to an attacker-controlled server.
Endpoint Compromise: Malware on a user's device or a compromised mobile app extracts the token from the device's secure storage or memory.
Network Interception: While TLS protects against passive network sniffing, misconfigurations, TLS termination proxies, or compromised certificate authorities can still expose tokens in transit.
Once the attacker has the Bearer token, they place it in the Authorization: Bearer <token> header of their own HTTP requests. The resource server (the API) validates the token's signature, checks its expiration, and grants access. The API has no way of knowing that the request is coming from an attacker's machine rather than the legitimate client.
How DPoP Actually Works: The Cryptographic Flow
DPoP changes the OAuth 2.0 flow by introducing a cryptographic binding between the token and the client. It requires the client to generate an asymmetric key pair (e.g., RSA or ECDSA). The private key never leaves the client. The public key is shared with the Authorization Server and the Resource Server.
Here is the step-by-step technical flow of a DPoP-enabled OAuth 2.0 transaction:
Step 1: Client Key Generation
The client application generates a new public/private key pair. This can be done per-session or per-token, depending on the security requirements.
Step 2: The DPoP Proof JWT
When the client requests an access token from the Authorization Server (e.g., during the Authorization Code flow), it generates a special JWT called a "DPoP Proof." This JWT is signed with the client's private key. It contains specific claims:
jti: A unique identifier for this specific proof (prevents replay attacks).
htm: The HTTP method of the request (e.g., "POST").
htu: The HTTP target URI (the token endpoint URL).
iat: The issuance time.
jwk: The client's public key, embedded directly in the JWT.
Step 3: Token Request with DPoP Header
The client sends the token request to the Authorization Server. Crucially, it includes the DPoP Proof JWT in a new HTTP header: DPoP: <proof_jwt>.
Step 4: Authorization Server Validation and Binding
The Authorization Server validates the DPoP Proof:
It verifies the signature using the public key (jwk) provided in the proof.
It checks that the htm and htu match the actual request.
It checks the jti against a short-term cache to prevent replay.
If valid, the Authorization Server issues the Access Token. However, this is not a standard Bearer token. The server modifies the token (or its metadata) to indicate it is a "DPoP-bound" token. In the case of a JWT access token, the server may include a cnf (confirmation) claim containing the thumbprint of the client's public key.
Step 5: Accessing the Resource Server
When the client wants to call the API, it cannot just send Authorization: Bearer <token>. It must generate a new DPoP Proof JWT, signed with its private key, targeting the specific API endpoint (htu = API URL, htm = "GET" or "POST").
The client sends the request with two headers:
Authorization: DPoP <access_token> (Note the change from "Bearer" to "DPoP").
DPoP: <new_proof_jwt>
Step 6: Resource Server Validation
The API (Resource Server) receives the request. It extracts the public key thumbprint from the cnf claim inside the access token. It then validates the signature of the DPoP header JWT using the client's public key. If the signature is valid, it proves the sender possesses the private key associated with the token. The API grants access.
Why This Stops Token Theft
If an attacker steals the access token via XSS or network interception, they face an insurmountable cryptographic barrier. To make a valid API request, the attacker must provide a valid DPoP header. To generate that header, they must sign a JWT with the client's private key.
Because the private key never left the legitimate client's secure environment (e.g., a Web Crypto API context or a secure mobile enclave), the attacker cannot forge the DPoP proof. When the attacker sends the stolen token with their own forged or missing DPoP header, the Resource Server's validation fails, and the request is rejected with a 401 Unauthorized.
Implementation Realities and Limitations
While DPoP is cryptographically sound, implementing it in the real world introduces operational complexity.
1. Browser and Client Support
DPoP requires the client to be capable of generating asymmetric keys and signing JWTs. In modern web browsers, this is handled via the Web Crypto API. However, older browsers or poorly configured HTTP clients may not support this. The client application must be explicitly coded to handle DPoP; it is not a transparent, drop-in replacement for Bearer tokens.
2. Proxy and WAF Interference
The DPoP HTTP header is non-standard (though now an RFC). Aggressive web application firewalls (WAFs) or overly strict reverse proxies may strip or block requests containing unknown headers or large JWT payloads in headers. Security teams must explicitly configure their edge infrastructure to allow the DPoP header and its typical payload size.
3. Token Replay Window
DPoP proofs include a jti (JWT ID) and an iat (issued at) claim. The Resource Server must maintain a short-term cache of seen jti values to prevent an attacker from capturing a valid DPoP request and replaying it identically. This introduces a minor stateful requirement to the otherwise stateless API, which must be managed carefully (e.g., using Redis with a TTL matching the proof's validity window, typically a few minutes).
4. Authorization Server Support
DPoP requires cooperation from both the client and the Authorization Server. As of recent updates, major providers like Microsoft Entra ID and Auth0 have begun supporting DPoP, but it is not universally enabled by default. It must be explicitly configured in the tenant and the application registration.
Real-World Scenario: Securing a Financial SPA
A fintech company builds a single-page application (SPA) that allows users to view their investment portfolios and initiate trades. The SPA uses OAuth 2.0 to get a Bearer token from their identity provider.
During a security audit, a penetration tester discovers a minor DOM-based XSS vulnerability in a third-party charting library used by the SPA. The tester successfully injects a script that reads the access token from sessionStorage and sends it to an external server.
Because the token was a standard Bearer token, the attacker immediately uses it to call the /api/v1/trade endpoint, successfully executing unauthorized trades. The MFA the user performed at login is completely bypassed because the token itself is the credential.
The DPoP Resolution:
The engineering team updates the SPA to use the Web Crypto API to generate an ephemeral key pair on page load. They modify the authentication flow to request a DPoP-bound token. They update the API gateway to require the DPoP header and validate the proof.
When the same XSS vulnerability is exploited, the attacker still steals the access token. However, when they attempt to call the /api/v1/trade endpoint, they cannot generate a valid DPoP proof because they do not have the private key (which is held in the browser's secure memory and is not accessible to the injected script due to same-origin and secure context policies, or simply because the attacker's server cannot sign it). The API rejects the request. The breach is contained to the theft of a useless string.
Decision Guidance: When to Mandate DPoP
Mandate DPoP when:
You are building high-value applications (financial, healthcare, administrative) where token theft would have severe consequences.
Your clients are modern SPAs or mobile applications capable of securely managing cryptographic keys.
You are exposing APIs that perform sensitive state-changing operations (e.g., financial transactions, configuration changes).
Stick to Bearer (with mitigations) when:
You are building low-risk, read-only APIs where the impact of token theft is minimal.
Your client ecosystem includes legacy systems or constrained IoT devices that cannot perform asymmetric cryptographic operations.
Your Authorization Server does not yet support DPoP, and upgrading is not feasible in the short term. (In this case, rely on short token lifetimes, strict CORS policies, and robust XSS prevention).
Practical Takeaways
Treat Bearer tokens as cash. Assume they will be stolen, and design your architecture to minimize the blast radius (short lifetimes, limited scopes).
Evaluate DPoP for high-risk applications. It provides a cryptographic guarantee that Bearer tokens cannot, effectively neutralizing stolen token attacks.
Prepare your infrastructure. If you adopt DPoP, ensure your WAFs, load balancers, and API gateways are configured to pass and process the DPoP HTTP header without truncation or blocking.
Implement replay protection. Ensure your Resource Server validates the jti claim in the DPoP proof and maintains a short-term cache to prevent identical request replay.
Start with the Authorization Server. Verify that your identity provider (e.g., Entra ID, Auth0, Keycloak) supports RFC 9449 before committing to a DPoP architecture.
Conclusion
The OAuth 2.0 Bearer token model is fundamentally flawed for high-security environments because it authenticates the token, not the holder of the token. DPoP (RFC 9449) represents a necessary evolution in API security, shifting the paradigm from "possession of the token" to "proof of possession of the key."
While implementing DPoP requires more effort from both client and server developers, the cryptographic assurance it provides against token theft makes it an essential consideration for any organization serious about securing its modern, API-driven architecture.
SUGGESTED INTERNAL LINKS
Anchor Text: Cross-Site Scripting (XSS)
Suggested Article: Modern XSS Mitigation Strategies: Beyond Input Sanitization
Reason: Explains the primary attack vector for token theft that DPoP is designed to mitigate.
Anchor Text: Microsoft Entra ID
Suggested Article: Configuring Advanced Token Protection in Microsoft Entra ID
Reason: Provides specific guidance on enabling DPoP and related token security features in Microsoft's identity platform.
Anchor Text: Web Crypto API
Suggested Article: Secure Client-Side Cryptography: A Practical Guide to the Web Crypto API
Reason: Details the browser-native mechanism required for SPAs to generate and manage the DPoP key pairs securely.
SOURCES
Source: OAuth 2.0 Demonstrating Proof of Possession (DPoP)
Organization: IETF (RFC 9449)
URL: https://datatracker.ietf.org/doc/html/rfc9449
Why it matters: The definitive, authoritative specification defining the DPoP protocol, header formats, and validation requirements.
Source: The OAuth 2.0 Authorization Framework: Bearer Token Usage
Organization: IETF (RFC 6750)
URL: https://datatracker.ietf.org/doc/html/rfc6750
Why it matters: The foundational document that defines the inherent security model (and vulnerability) of Bearer tokens.
Source: Protect your APIs with DPoP (Demonstrating Proof of Possession)
Organization: Microsoft Learn
URL: https://learn.microsoft.com/en-us/entra/identity-platform/proof-of-possession-tokens
Why it matters: Official vendor documentation detailing how Microsoft Entra ID implements and supports the DPoP standard.
ARTICLE #: 13
Title: Windows LAPS in Entra ID: Architecture, Limitations, and Deployment Realities
Category: Enterprise IT / Windows
Primary Keyword: Windows LAPS in Entra ID
Secondary Keywords: cloud LAPS, local administrator password solution, Entra ID join LAPS, Windows LAPS CSP, legacy LAPS migration
Search Intent: Informational / Technical Implementation
Suggested Slug: windows-laps-entra-id-architecture-deployment
SEO Title: Windows LAPS in Entra ID: The Architecture and Reality of Cloud LAPS
Meta Description: The new cloud-native Windows LAPS eliminates the need for AD schema updates. Learn how it works, its limitations, and how to deploy it successfully in modern environments.
Target Reader: System administrators, Intune engineers, identity architects, IT managers
Core Question: How does the new cloud-native Windows LAPS differ from the legacy GPO version, and what are the practical realities of deploying it in an Entra ID environment?
Unique Angle: Moving beyond the "it's easier" marketing to detail the specific mechanics of the LAPS CSP, the RBAC requirements in Entra ID, and the common pitfalls of hybrid identity deployments.
Estimated Reading Time: 11 minutes
Word Count: ~2,100
ARTICLE
For nearly two decades, the Microsoft Local Administrator Password Solution (LAPS) has been the gold standard for securing local administrator accounts on Windows devices. By randomly generating, rotating, and storing local admin passwords in Active Directory, it eliminated the risk of a single, static local admin password being used to pivot across an enterprise network.
However, legacy LAPS had a significant drawback: it required extending the Active Directory schema and relied on Group Policy, making it unusable for cloud-native, Entra ID (Azure AD) joined devices or remote workers who rarely connected to the corporate network.
Microsoft has addressed this with the new, cloud-native Windows LAPS. Integrated directly into Windows 10 (version 20H2 and later) and Windows 11, and managed via Microsoft Intune and Entra ID, this new iteration promises to bring local admin security to the modern workplace without the baggage of on-premises infrastructure.
But migrating to or deploying cloud LAPS is not without its complexities. Understanding its architecture, the role of Configuration Service Providers (CSPs), and the strict Entra ID RBAC requirements is critical for a successful implementation.
The Short Answer
The new Windows LAPS uses the Windows MDM Configuration Service Provider (CSP) to manage local administrator passwords. Instead of writing the password to an Active Directory attribute, the device encrypts the password and backs it up directly to the device's Entra ID object.
This eliminates the need for AD schema extensions, Group Policy, or on-premises connectivity. However, it requires strict Entra ID Role-Based Access Control (RBAC) configuration to ensure that only authorized IT personnel can read the passwords, and it introduces new considerations for Hybrid Entra ID joined devices.
The Architecture of Cloud LAPS
To deploy Cloud LAPS effectively, you must understand how the components interact. The architecture consists of three main pillars:
The LAPS CSP (Client-Side): Built into modern Windows, this CSP handles the generation of the complex password, the encryption of that password using a device-specific key, and the secure transmission of the encrypted blob to Entra ID. It also handles the automatic rotation of the password based on the configured policy.
Entra ID (Directory-Side): The encrypted password blob is stored as an attribute on the device object in Entra ID (msDS-ManagedPassword). Entra ID does not store the password in plaintext; it only holds the encrypted payload.
Intune (Management-Side): Intune is used to deliver the LAPS configuration policy to the devices. This policy dictates the password complexity, rotation frequency, and which local administrator account (the built-in "Administrator" or a custom-named account) is managed.
Legacy LAPS vs. Cloud LAPS: The Critical Differences
Feature
Legacy LAPS (GPO)
Cloud LAPS (Entra ID / Intune)
Directory Requirement
Active Directory (requires Schema Extension)
Microsoft Entra ID (no schema changes)
Management Mechanism
Group Policy Object (GPO)
Intune Configuration Profile (CSP)
Password Storage
AD Attribute (plaintext, protected by ACLs)
Entra ID Device Attribute (encrypted blob)
Device State Support
Domain Joined, Hybrid Joined
Entra ID Joined, Hybrid Entra ID Joined
Network Dependency
Requires connectivity to Domain Controller
Requires connectivity to Entra ID / Internet
The elimination of the AD schema extension is the most significant operational improvement. It removes the primary barrier to entry for organizations that were hesitant to adopt LAPS due to the perceived risk or complexity of modifying the AD schema.
The Deployment Reality: Intune Configuration
Deploying Cloud LAPS is done via an Intune Configuration Profile. The profile is straightforward, but the choices you make have lasting operational impacts.
1. Account Selection: You can choose to manage the built-in "Administrator" account or specify a custom local administrator account name. Best Practice: Manage the built-in Administrator account. Creating a custom account can lead to conflicts if the device already has a local account with that name, causing the LAPS CSP to fail silently.
2. Password Complexity and Rotation: You define the length, character requirements, and rotation interval (e.g., every 30 days). The LAPS CSP handles the rotation automatically. If the device is offline when the rotation is due, it will rotate the password the next time it connects and successfully backs up the new password to Entra ID.
3. Backup Directory: You must explicitly configure the policy to back up the password to "Entra ID" (or "Active Directory" if you are in a hybrid environment and still wish to use the legacy method, though this defeats the purpose of Cloud LAPS).
The RBAC Reality: Securing Password Access
In legacy LAPS, you delegated read access to the AD attribute using standard Active Directory ACLs. In Cloud LAPS, you must use Entra ID Role-Based Access Control (RBAC).
This is where many deployments fail. By default, no one can read the LAPS password from Entra ID, not even Global Administrators (unless they assign themselves the specific role).
To allow your helpdesk or desktop support team to retrieve passwords, you must:
Create a custom Entra ID Role (or use the built-in "Intune Service Administrator" or a custom role with specific permissions).
Grant this role the DeviceLocalAdministratorPassword.Read.All permission.
Assign this role to the specific security group containing your support staff.
If you attempt to view the password in the Intune portal or via PowerShell without this specific RBAC assignment, you will receive an "Access Denied" or "No password found" error, even if the device is fully compliant and the backup was successful.
Real-World Scenario: The Hybrid Join Confusion
Consider an organization with 5,000 devices. Half are legacy "Hybrid Entra ID Joined" (domain-joined and registered with Entra ID), and half are new "Entra ID Joined" (cloud-only).
The IT team deploys a single Intune LAPS policy targeting all Windows devices, configured to back up to "Entra ID".
For the Entra ID Joined devices, the deployment is flawless. The CSP generates the password, encrypts it, and backs it up to the device's Entra ID object. Support staff can retrieve it via the Intune portal.
For the Hybrid Entra ID Joined devices, the behavior is inconsistent. Because these devices are still domain-joined, the legacy LAPS GPO might still be applying, or the device might be attempting to back up to Active Directory if the policy is misconfigured. Furthermore, if the organization has not explicitly enabled the "Backup directory" setting to include Entra ID for hybrid devices, the password will not appear in the cloud.
The Resolution:
The IT team must audit their environment. For Hybrid devices, they must ensure that the legacy GPO is explicitly disabled or overridden, and that the Intune LAPS policy is explicitly configured to back up to Entra ID. They must also verify that the devices have the necessary network connectivity to reach the Entra ID endpoints, as Hybrid devices sometimes have restrictive proxy rules that block cloud MDM traffic.
Common Mistakes in Cloud LAPS Deployment
1. Assuming Immediate Availability
After applying the Intune policy, the LAPS CSP does not generate and back up the password instantly. It operates on a schedule. It can take several hours, or a manual sync/reboot, for the password to appear in Entra ID. Administrators often panic, assuming the policy failed, when it is simply processing.
2. Misunderstanding the Encryption
Some organizations worry that storing the password in Entra ID is insecure. It is critical to understand that the password is encrypted on the device using a key derived from the device's TPM (Trusted Platform Module) before it is ever sent to the cloud. Microsoft cannot read this password. It can only be decrypted by a user who has the appropriate RBAC rights and is querying it through the authorized Intune/Entra ID interfaces.
3. Forgetting to Rename the Built-in Administrator
While LAPS secures the password, the account name "Administrator" is still a well-known target for brute-force attacks. Best practice dictates that the Intune LAPS policy should be configured to rename the built-in Administrator account to something obscure (e.g., "SysMaint_884") in addition to managing its password.
Troubleshooting Cloud LAPS
When a password does not appear in Entra ID, follow this systematic troubleshooting path:
Verify Policy Application: On the target device, open Settings > Accounts > Access work or school. Check the "Info" section to ensure the LAPS configuration profile is listed as "Applied."
Check the Event Viewer: Open Event Viewer and navigate to Applications and Services Logs > Microsoft > Windows > LAPS > Operational. This log is the definitive source of truth. Look for Event ID 10015 (successful backup) or specific error codes indicating why the backup failed (e.g., network issues, RBAC denial).
Verify RBAC: Ensure the account you are using to check the password has been explicitly granted the DeviceLocalAdministratorPassword.Read.All permission in Entra ID.
Check Device State: Confirm the device is actually Entra ID Joined or Hybrid Entra ID Joined. A purely "Registered" (BYOD) device will not process device-targeted LAPS policies.
Practical Takeaways
Ditch the schema update. The primary advantage of Cloud LAPS is the elimination of AD schema extensions. Embrace this and avoid trying to force hybrid configurations unless absolutely necessary.
Configure RBAC explicitly. Do not assume Global Admins can see the passwords. Create a dedicated, least-privilege Entra ID role for your support staff to read LAPS passwords.
Rename the account. Use the Intune policy to rename the built-in Administrator account to a non-standard name to reduce the attack surface for brute-force attempts.
Monitor the Operational Log. The LAPS > Operational event log on the client device is your best friend for troubleshooting backup failures.
Be patient. Allow time for the CSP to process, generate, and back up the password after policy deployment. Do not declare failure after 10 minutes.
Conclusion
The new Windows LAPS in Entra ID represents a significant maturation of endpoint security. It brings the robust, randomized password management of legacy LAPS to the modern, cloud-first workplace without the historical baggage of Active Directory schema modifications.
However, its success depends on a clear understanding of the MDM CSP architecture and strict adherence to Entra ID RBAC principles. By configuring the policies correctly, securing the read access, and understanding the troubleshooting pathways, IT teams can effectively neutralize the risk of lateral movement via local administrator accounts across their entire device fleet.
SUGGESTED INTERNAL LINKS
Anchor Text: Entra ID Role-Based Access Control (RBAC)
Suggested Article: Designing Least-Privilege RBAC Models in Microsoft Entra ID
Reason: Provides deeper context on how to safely delegate specific permissions like LAPS password reading without over-privileging support staff.
Anchor Text: Hybrid Entra ID Join
Suggested Article: Entra ID Join vs. Hybrid Entra ID Join: Which Device State is Right?
Reason: Clarifies the device state complexities mentioned in the real-world scenario, helping admins choose the right join type for LAPS.
Anchor Text: Configuration Service Providers (CSPs)
Suggested Article: Deep Dive into Windows MDM: Understanding Configuration Service Providers
Reason: Explains the underlying mechanism by which Intune communicates with the Windows LAPS engine.
SOURCES
Source: Windows LAPS overview
Organization: Microsoft Learn
URL: https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-overview
Why it matters: Official Microsoft documentation detailing the architecture, supported Windows versions, and core concepts of the new LAPS.
Source: Configure Windows LAPS using Intune
Organization: Microsoft Learn
URL: https://learn.microsoft.com/en-us/mem/intune/protect/laps-configure
Why it matters: Provides the step-by-step technical guidance for creating the Intune configuration profiles and setting the backup directory.
Source: Manage access to Windows LAPS passwords
Organization: Microsoft Learn
URL: https://learn.microsoft.com/en-us/mem/intune/protect/laps-manage-access
Why it matters: Authoritative documentation on the specific Entra ID RBAC permissions required to view and manage LAPS passwords.
ARTICLE #: 14
Title: Kubernetes Storage Classes: The Hidden Costs and Performance Traps of Dynamic Provisioning
Category: Cloud / Infrastructure
Primary Keyword: Kubernetes Storage Classes dynamic provisioning
Secondary Keywords: Persistent Volume Claims, reclaim policy, WaitForFirstConsumer, cloud block storage costs, Kubernetes storage performance
Search Intent: Informational / Technical Architecture
Suggested Slug: kubernetes-storage-classes-costs-performance-traps
SEO Title: Kubernetes Storage Classes: The Hidden Costs and Performance Traps of Dynamic Provisioning
Meta Description: Dynamic provisioning in Kubernetes simplifies storage, but it can lead to massive cost overruns and performance issues. Learn how to configure StorageClasses safely.
Target Reader: Kubernetes engineers, cloud architects, DevOps, platform engineers
Core Question: What are the operational and financial pitfalls of using dynamic provisioning with Kubernetes StorageClasses, and how can they be mitigated?
Unique Angle: Moving beyond the basic "how to create a PVC" tutorial to expose the real-world consequences of ReclaimPolicy, volumeBindingMode, and unregulated IOPS provisioning in cloud environments.
Estimated Reading Time: 12 minutes
Word Count: ~2,300
ARTICLE
Kubernetes Persistent Volumes (PVs) and Persistent Volume Claims (PVCs) abstract the complexity of underlying storage infrastructure. Instead of manually provisioning an AWS EBS volume or an Azure Disk and attaching it to a node, developers simply request storage via a PVC, and the cluster's StorageClass dynamically provisions it.
This dynamic provisioning is a cornerstone of Kubernetes' developer experience. However, it is also a primary source of unexpected cloud billing shocks, performance degradation, and scheduling failures.
When engineering teams treat cloud storage as an infinite, free resource requested via YAML, they inevitably encounter the hidden traps of dynamic provisioning. Understanding the mechanics of StorageClasses, reclaim policies, and volume binding is not optional; it is a financial and operational necessity.
The Short Answer
Dynamic provisioning in Kubernetes automates the creation of cloud storage, but it delegates critical financial and operational decisions to the developer.
The most significant risks are:
Orphaned Storage Costs: Using the Delete reclaim policy can accidentally destroy data, while the Retain policy can leave expensive, unattached cloud volumes running indefinitely after a PVC is deleted.
Scheduling Deadlocks: The default Immediate volume binding mode can provision a volume in an Availability Zone (AZ) where no suitable node exists to run the pod, resulting in a permanently pending pod.
Performance/Cost Mismatches: Default StorageClasses often provision baseline storage tiers that cannot handle production IOPS requirements, or conversely, allow developers to request provisioned IOPS without financial guardrails, leading to massive bill inflation.
The Dynamic Provisioning Flow
To understand the traps, you must understand the sequence of events when a PVC is created:
A user creates a PersistentVolumeClaim (PVC) specifying a storageClassName, requested size, and access mode.
The Kubernetes control plane sees the unbound PVC and identifies the referenced StorageClass.
The StorageClass defines a provisioner (e.g., kubernetes.io/aws-ebs, disk.csi.azure.com).
The provisioner (typically a CSI driver running as a pod in the cluster) communicates with the cloud provider's API to create the physical storage resource (e.g., an EBS volume).
The provisioner creates a PersistentVolume (PV) object in Kubernetes representing this new cloud resource and binds it to the PVC.
When a pod is scheduled that references this PVC, the kubelet on the target node instructs the CSI driver to attach the cloud volume to that specific node and mount it into the pod's filesystem.
Trap 1: The Reclaim Policy Reality
The reclaimPolicy of a StorageClass dictates what happens to the underlying cloud storage when the Kubernetes PVC is deleted. There are two options: Delete and Retain.
The Delete Policy (The Default)
When the PVC is deleted, the CSI driver automatically deletes the underlying cloud volume.
The Risk: Accidental deletion. If a developer mistakenly deletes a StatefulSet or a PVC, the data is permanently and immediately destroyed. There is no "Recycle Bin" for dynamically provisioned cloud volumes unless the cloud provider has a specific, separate backup mechanism in place.
The Retain Policy
When the PVC is deleted, the PV object remains in Kubernetes in a Released state, and the underlying cloud volume is not deleted.
The Risk: Financial bleed. The cloud provider continues to charge for the provisioned volume, even though it is no longer attached to any node or managed by an active PVC. In large clusters, teams frequently delete applications during testing but forget to manually clean up the Released PVs and the corresponding cloud volumes. Over months, this "zombie storage" accumulates into thousands of dollars in wasted spend.
The Architectural Fix: For production databases, use Retain to prevent accidental data loss, but pair it with strict operational discipline or automated cleanup scripts that alert on Released PVs. For ephemeral, stateless testing environments, Delete is appropriate, but developers must be trained on the permanence of the action.
Trap 2: The Availability Zone Scheduling Deadlock
This is the most common cause of "my pod is stuck in Pending" in multi-AZ clusters.
By default, many StorageClasses are configured with volumeBindingMode: Immediate. This means that as soon as the PVC is created, the CSI driver provisions the cloud volume.
In cloud environments, block storage (like AWS EBS or Azure Disks) is zonal. An EBS volume created in us-east-1a can only be attached to an EC2 instance in us-east-1a.
If the PVC is created and the volume is provisioned in us-east-1a, but the Kubernetes scheduler subsequently decides to place the pod on a node in us-east-1b (due to resource availability or affinity rules), the attachment will fail. The pod will remain in a Pending or ContainerCreating state indefinitely, with events showing an "AttachVolume.Attach failed" error.
The Architectural Fix: Always set volumeBindingMode: WaitForFirstConsumer on production StorageClasses.
This mode delays the provisioning of the cloud volume until a pod that uses the PVC is actually scheduled. The Kubernetes scheduler first selects a suitable node based on all constraints (resources, affinities, taints). Once the node is selected, the CSI driver provisions the volume in the same Availability Zone as that node. This guarantees that the volume and the pod will always be co-located, eliminating the zoning deadlock.
Trap 3: The IOPS and Performance Illusion
StorageClasses often allow developers to specify performance parameters, such as iopsPerGB or throughput.
The Under-Provisioning Trap:
The default StorageClass in many managed Kubernetes services (like EKS or AKS) provisions the cheapest, baseline storage tier (e.g., AWS gp2 or Azure Standard SSD). These volumes have burstable performance that degrades significantly under sustained load. A developer deploying a production database may find it performs adequately during testing but throttles severely under real-world load, causing application timeouts.
The Over-Provisioning Trap:
Conversely, if a StorageClass allows developers to request high IOPS (e.g., AWS io2 or Azure Premium SSD), and a developer requests 10,000 IOPS for a low-traffic logging application, the cloud provider will happily provision it and bill the organization for the peak capacity, regardless of actual usage. Cloud block storage is priced on provisioned capacity, not consumed capacity.
The Architectural Fix:
Do not expose high-performance, high-cost StorageClasses to general developer namespaces.
Use Kubernetes ResourceQuotas and LimitRanges to cap the maximum storage size and IOPS a namespace can request.
Create distinct StorageClasses for distinct workloads (e.g., ebs-sc-standard for logs, ebs-sc-premium for databases) and enforce their use via admission controllers (like OPA Gatekeeper or Kyverno).
Real-World Scenario: The Zombie Volume Epidemic
A mid-sized tech company runs a 50-node EKS cluster. Developers frequently spin up ephemeral environments for pull request testing. These environments include a PostgreSQL database backed by a PVC using the default StorageClass, which has reclaimPolicy: Delete.
To prevent accidental data loss during testing, a well-meaning platform engineer changes the StorageClass to reclaimPolicy: Retain.
Over the next six months, developers create and delete hundreds of test environments. Because the policy is now Retain, every deleted PVC leaves behind a Released PV in Kubernetes and an unattached EBS volume in AWS. The developers, assuming the cloud resources are cleaned up, move on.
The platform team does not have monitoring set up for orphaned cloud resources. Six months later, the AWS bill arrives with a $4,000 surprise charge for EBS volumes. An audit reveals over 200 unattached volumes, totaling 10TB of storage, sitting idle.
The Resolution:
The platform team implements a multi-layered fix:
They revert the default StorageClass to Delete for ephemeral namespaces, accepting the risk of data loss as the trade-off for cost control.
For production namespaces, they create a specific Retain StorageClass, but implement a daily Lambda function that scans for Released PVs and unattached EBS volumes, sending a Slack alert to the namespace owner for manual cleanup.
They enforce volumeBindingMode: WaitForFirstConsumer across all StorageClasses to prevent scheduling deadlocks.
Common Mistakes in Storage Management
1. Using NFS or EFS for Databases
While Amazon EFS or Azure Files provide convenient, multi-AZ read-write-many (RWX) storage, they are network file systems. They introduce significant latency and are generally unsuitable for the random I/O patterns of relational databases (PostgreSQL, MySQL). Use block storage (EBS, Azure Disk) for databases, and reserve file storage for shared application assets or logs.
2. Ignoring the CSI Driver Version
The Container Storage Interface (CSI) driver is a critical piece of infrastructure. Running an outdated CSI driver can lead to bugs in volume attachment, snapshotting, or resizing. Treat the CSI driver with the same operational rigor as the Kubernetes control plane, keeping it updated and monitored.
3. Assuming Storage Resizing is Seamless
While Kubernetes supports expanding PVCs (if allowVolumeExpansion: true is set in the StorageClass), the underlying application must also support online filesystem resizing. Not all applications or older filesystems can handle this without a pod restart. Always test volume expansion in a staging environment before relying on it for production capacity management.
Decision Guidance: StorageClass Design Matrix
Workload Type
Recommended Volume Type
Reclaim Policy
Binding Mode
Notes
Production Database
Cloud Block (e.g., EBS gp3, Azure Premium)
Retain
WaitForFirstConsumer
Requires manual cleanup of orphaned volumes. High performance.
Ephemeral / Testing
Cloud Block (e.g., EBS gp3)
Delete
WaitForFirstConsumer
Prevents zombie storage costs. Data loss on delete is expected.
Shared Logs / Assets
Cloud File (e.g., EFS, Azure Files)
Delete
Immediate
Supports ReadWriteMany (RWX). Lower performance, higher flexibility.
High-Throughput Analytics
Cloud Block (Provisioned IOPS)
Retain
WaitForFirstConsumer
Strictly controlled via ResourceQuotas to prevent billing shock.
Practical Takeaways
Mandate WaitForFirstConsumer. This single setting prevents the vast majority of pod scheduling failures related to storage in multi-AZ clusters.
Audit your Reclaim Policies. Understand the financial and data-loss implications of Delete vs. Retain. Implement automated tooling to detect and alert on Released PVs and unattached cloud volumes.
Segment your StorageClasses. Do not use a single default StorageClass for everything. Create distinct classes for different performance tiers and enforce their use via policy engines like Kyverno or OPA Gatekeeper.
Monitor CSI Driver Health. The CSI driver is a critical control plane component. Monitor its pods for restarts and errors, as failures here will block all storage provisioning and attachment.
Educate developers. Ensure developers understand that a PVC is not just a Kubernetes object; it is a direct request for billable cloud infrastructure.
Conclusion
Dynamic provisioning in Kubernetes is a powerful abstraction, but it is not magic. It delegates the provisioning of expensive, stateful cloud resources to automated processes.
By understanding the mechanical realities of reclaim policies, the zonal constraints of cloud block storage, and the performance characteristics of different volume types, platform engineers can design StorageClasses that empower developers without exposing the organization to catastrophic data loss or financial waste. Storage in Kubernetes must be managed with the same rigor as compute and networking.
SUGGESTED INTERNAL LINKS
Anchor Text: ResourceQuotas and LimitRanges
Suggested Article: Enforcing Resource Governance in Kubernetes with Quotas and LimitRanges
Reason: Explains how to technically implement the financial guardrails recommended for preventing IOPS over-provisioning.
Anchor Text: OPA Gatekeeper / Kyverno
Suggested Article: Policy as Code in Kubernetes: A Practical Guide to Kyverno
Reason: Details how to enforce the use of specific, approved StorageClasses for different namespaces.
Anchor Text: Container Storage Interface (CSI)
Suggested Article: Understanding the Container Storage Interface (CSI) in Kubernetes
Reason: Provides the foundational knowledge of how the CSI driver bridges Kubernetes and the cloud provider's storage API.
SOURCES
Source: Storage Classes
Organization: Kubernetes Documentation
URL: https://kubernetes.io/docs/concepts/storage/storage-classes/
Why it matters: The authoritative definition of StorageClass parameters, including reclaimPolicy and volumeBindingMode.
Source: Persistent Volumes
Organization: Kubernetes Documentation
URL: https://kubernetes.io/docs/concepts/storage/persistent-volumes/
Why it matters: Details the lifecycle of a PV, including the critical Retain and Delete reclaim behaviors.
Source: Amazon EBS CSI Driver
Organization: AWS Documentation
URL: https://docs.aws.amazon.com/eks/latest/userguide/ebs-csi.html
Why it matters: Provides cloud-specific context on how the CSI driver interacts with EBS, including zonal constraints and performance tier configurations.
ARTICLE #: 15
Title: Secrets Management in CI/CD: Why Vault is Not a Magic Bullet and How to Actually Secure Pipelines
Category: Cybersecurity / Enterprise Architecture
Primary Keyword: secrets management in CI/CD Vault OIDC
Secondary Keywords: HashiCorp Vault JWT OIDC, GitHub Actions secrets, CI/CD security, dynamic secrets, supply chain security
Search Intent: Informational / Technical Architecture
Suggested Slug: secrets-management-cicd-vault-oidc-reality
SEO Title: Secrets Management in CI/CD: The Reality of Vault and OIDC Authentication
Meta Description: Storing static secrets in CI/CD variables is a major security risk. Learn how to properly secure pipelines using HashiCorp Vault and OIDC authentication.
Target Reader: DevSecOps engineers, platform engineers, CISOs, cloud architects
Core Question: Why are static secrets in CI/CD pipelines inherently vulnerable, and how does OIDC authentication to HashiCorp Vault provide a secure, practical alternative?
Unique Angle: Moving beyond the "just put it in Vault" cliché to explain the exact mechanics of JWT/OIDC authentication, the common configuration pitfalls, and the operational reality of managing dynamic secrets in automated pipelines.
Estimated Reading Time: 12 minutes
Word Count: ~2,300
ARTICLE
Continuous Integration and Continuous Deployment (CI/CD) pipelines are the central nervous system of modern software delivery. They build, test, and deploy code to production environments. To perform these tasks, pipelines require access to sensitive credentials: cloud provider keys, database passwords, and API tokens.
Historically, the standard practice has been to store these credentials as static "Secrets" or "Variables" within the CI/CD platform itself (e.g., GitHub Actions Secrets, GitLab CI/CD Variables).
This model is fundamentally broken. Static secrets in CI/CD platforms are a prime target for supply chain attacks. If an attacker compromises a developer's account, injects malicious code into a repository, or exploits a vulnerability in a third-party GitHub Action, they can easily exfiltrate these static secrets. Once extracted, the attacker has persistent, long-lived access to your production environment.
The industry-standard solution to this problem is to externalize secrets management to a dedicated system like HashiCorp Vault, and to authenticate the CI/CD pipeline to Vault using OpenID Connect (OIDC).
However, simply installing Vault does not magically secure your pipeline. Implementing OIDC authentication requires a precise understanding of identity federation, JWT claim mapping, and strict role scoping. Misconfigurations in this area can render the entire security model ineffective.
The Short Answer
Storing static, long-lived secrets in CI/CD platforms creates a high-value target for attackers.
The secure alternative is to configure the CI/CD platform to authenticate to HashiCorp Vault using OIDC. The CI/CD runner proves its identity to Vault by presenting a short-lived JSON Web Token (JWT) issued by the CI/CD provider (e.g., GitHub or GitLab). Vault validates this token, verifies the specific repository, branch, and environment, and dynamically issues short-lived, highly scoped credentials (e.g., temporary AWS STS credentials) for that specific pipeline run.
This eliminates static secrets from the CI/CD platform entirely and ensures that even if a pipeline is compromised, the attacker only gains access to a credential that expires in minutes and is restricted to a specific, narrow set of actions.
The Static Secret Anti-Pattern
To understand why OIDC is necessary, consider the lifecycle of a static CI/CD secret:
An administrator generates a long-lived AWS Access Key (valid for years).
The administrator pastes this key into the "Secrets" section of a GitHub Repository.
The GitHub Actions workflow references this secret (${{ secrets.AWS_ACCESS_KEY }}) and exports it to the environment of a runner.
The runner uses this key to deploy to AWS.
The Vulnerabilities:
Exfiltration: A compromised workflow (e.g., via a malicious pull request or a compromised third-party Action) can simply execute echo "${{ secrets.AWS_ACCESS_KEY }}" and send the output to an attacker-controlled server.
Lack of Auditability: The AWS Access Key is shared among all workflows in that repository. If the key is used maliciously, AWS CloudTrail logs will only show that the key was used, not which specific workflow or developer action triggered it.
No Automatic Rotation: Static keys are rarely rotated due to the operational friction of updating them in every repository that uses them.
The Mechanics of OIDC Federation
OIDC (OpenID Connect) solves this by replacing the static secret with a dynamic, cryptographic proof of identity. The CI/CD provider acts as the Identity Provider (IdP), and Vault acts as the Service Provider (SP).
Here is the step-by-step technical flow of a secure OIDC pipeline:
Step 1: The Workflow Requests a JWT
The GitHub Actions (or GitLab CI) workflow is configured with permissions: id-token: write. When the job runs, the runner automatically contacts the CI/CD provider's metadata endpoint and requests a JWT.
Step 2: The JWT is Issued
The CI/CD provider generates a JWT. This token is cryptographically signed by the provider's private key. Crucially, the JWT payload contains specific claims about the workflow's context, such as:
sub (Subject): e.g., repo:myorg/myrepo:ref:refs/heads/main
aud (Audience): The intended recipient (e.g., vault.mycompany.com)
environment: e.g., production
Step 3: The Runner Presents the JWT to Vault
The workflow passes this JWT to HashiCorp Vault via the Vault API, requesting a token.
Step 4: Vault Validates the JWT
Vault is configured with a JWT/OIDC Auth Method. It knows the public key of the CI/CD provider (either fetched via OIDC discovery or statically configured). Vault validates the JWT's signature to ensure it was genuinely issued by GitHub/GitLab and has not been tampered with.
Step 5: Vault Evaluates Claims and Issues a Role
Vault does not just accept any valid JWT. It is configured with specific "Roles" that map JWT claims to Vault policies. For example, a Vault role might state: "If the JWT claim sub matches repo:myorg/myrepo:ref:refs/heads/main, allow access to the aws-prod-deploy role."
If the claims match, Vault generates a short-lived Vault token (or directly generates dynamic secrets, like AWS STS credentials) and returns them to the runner.
Step 6: The Runner Executes with Dynamic Credentials
The runner uses these short-lived, dynamically generated credentials to perform its task. Once the workflow completes, the credentials expire. There is no long-lived secret stored in GitHub, and the credentials are useless to an attacker after the pipeline finishes.
Implementation Realities and Configuration Pitfalls
While the theory is elegant, implementing OIDC with Vault is where most teams stumble. The devil is in the details of the configuration.
1. Overly Broad Claim Matching
A common mistake is configuring the Vault role to accept any JWT from the CI/CD provider, or matching only on the organization name (e.g., sub matches repo:myorg/*).
The Fix: Be as specific as possible. Require exact matches for the repository name, the branch (refs/heads/main), and the environment (environment: production). This ensures that a workflow running on a feature branch or a forked repository cannot assume the production deployment role.
2. The Audience (aud) Claim Mismatch
The JWT includes an aud claim to prevent token reuse across different services. If Vault is configured to expect aud: vault.mycompany.com, but the GitHub Action requests a token with a different audience (or the default GitHub audience), Vault will reject the token with a 400 Bad Request error. You must explicitly configure the audience parameter in the CI/CD workflow's id-token request to match Vault's configuration.
3. Token TTL and Pipeline Duration
Vault issues tokens with a Time-To-Live (TTL). If a CI/CD pipeline is long-running (e.g., a complex build and test process that takes 45 minutes), but the Vault token is configured with a 15-minute TTL, the pipeline will fail midway through when attempting to access secrets.
The Fix: Carefully calibrate the Vault role's ttl and max_ttl to comfortably exceed the maximum expected duration of the pipeline, while still remaining as short as practically possible.
4. Network Accessibility
The CI/CD runner (especially if it is a self-hosted runner in a private VPC) must be able to reach the Vault server over the network. If Vault is internal, ensure the runner has the necessary routing and security group permissions to access the Vault API endpoint.
Real-World Scenario: The Compromised Third-Party Action
Consider a development team using GitHub Actions. Their workflow uses a popular, third-party open-source Action to deploy to AWS. The workflow uses static AWS keys stored in GitHub Secrets.
An attacker compromises the maintainer's account of that third-party Action and pushes a malicious update. The new code contains a simple script that echoes all environment variables to a public pastebin.
Because the workflow uses static secrets, the attacker immediately captures the long-lived AWS Access Key. They use this key to spin up cryptomining instances in the company's AWS account, resulting in a $10,000 bill before the anomaly is detected.
The OIDC Resolution:
The team migrates to Vault OIDC. The workflow no longer contains static AWS keys. Instead, it requests a JWT and exchanges it with Vault for temporary AWS STS credentials.
When the attacker's malicious code executes, it attempts to exfiltrate the AWS credentials. However, the credentials it finds are temporary STS tokens tied to a highly restricted IAM role (e.g., Allow: s3:PutObject on a single, specific bucket). Furthermore, these tokens are set to expire in 15 minutes.
Even if the attacker captures the token, its utility is severely limited. It cannot be used to spin up EC2 instances, and it will expire before the attacker can establish persistent access. The blast radius of the supply chain compromise is contained.
Decision Guidance: When to Use OIDC with Vault
Mandate OIDC with Vault when:
Your pipelines deploy to production or access sensitive customer data.
You are using self-hosted runners, which have a larger attack surface than managed, ephemeral runners.
You need fine-grained auditability of exactly which pipeline run accessed which secret.
Static Secrets (with strict controls) may be acceptable when:
The pipeline only accesses low-risk, non-production environments.
The CI/CD platform's native secret management is augmented with strict repository-level access controls, branch protection rules, and environment approval gates, and the organization lacks the maturity to operate Vault.
Practical Takeaways
Eradicate static cloud credentials from CI/CD. Treat any long-lived access key stored in GitHub/GitLab as a critical vulnerability.
Implement OIDC federation. Configure your CI/CD provider to issue JWTs and configure Vault to validate them. This is the industry-standard pattern for secure pipeline authentication.
Be ruthlessly specific with Vault claim mapping. Do not use wildcards in your Vault role's bound_claims unless absolutely necessary. Bind access to specific repositories, branches, and environments.
Audit the aud claim. Ensure the audience requested by the CI/CD workflow exactly matches the audience expected by the Vault JWT auth method configuration.
Use dynamic secrets where possible. Instead of having Vault return a static database password, configure Vault's AWS or Database secrets engines to generate a brand-new, short-lived credential for each pipeline run.
Conclusion
The phrase "we store our secrets in Vault" is no longer sufficient. If the CI/CD pipeline authenticates to Vault using a static, long-lived token, the fundamental vulnerability remains: that token can be stolen.
OIDC federation represents a paradigm shift in CI/CD security. It replaces static, shared secrets with dynamic, cryptographic proof of identity. By implementing OIDC with strict claim validation and dynamic secret generation, organizations can ensure that their software delivery pipelines are resilient against the growing threat of supply chain attacks.
SUGGESTED INTERNAL LINKS
Anchor Text: OpenID Connect (OIDC)
Suggested Article: OAuth 2.0 and OpenID Connect: A Practical Guide for Enterprise Architects
Reason: Provides the foundational understanding of the OIDC protocol that underpins the JWT authentication flow.
Anchor Text: HashiCorp Vault
Suggested Article: Architecting Centralized Secrets Management with HashiCorp Vault
Reason: Details the broader operational considerations of deploying and managing Vault in an enterprise environment.
Anchor Text: Supply Chain Security
Suggested Article: Securing the Software Supply Chain: From Code Commit to Production
Reason: Contextualizes the CI/CD secret management problem within the broader framework of software supply chain security.
SOURCES
Source: JWT/OIDC Auth Method
Organization: HashiCorp Vault Documentation
URL: https://developer.hashicorp.com/vault/docs/auth/jwt
Why it matters: The authoritative documentation detailing how Vault validates JSON Web Tokens and maps claims to roles.
Source: Security hardening for GitHub Actions
Organization: GitHub Documentation
URL: https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions
Why it matters: Official guidance from GitHub on the risks of static secrets and the recommended architecture for using OIDC to authenticate to cloud providers and external systems.
Source: CI/CD Secrets Management
Organization: OWASP Foundation
URL: https://owasp.org/www-project-top-10-ci-cd-security-risks/
Why it matters: Industry-standard context identifying hardcoded credentials in CI/CD pipelines as a top-tier security risk.