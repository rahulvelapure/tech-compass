import type { Article } from "../../types";

export const article: Article = {
  slug: "graphql-vs-rest-vs-grpc-api-gateway-performance",
  category: "development",
  contentType: "comparison",
  subcategory: "APIs",
  title: "The API protocol you pick decides what your gateway can still do for you",
  seoTitle: "GraphQL vs REST vs gRPC: What Each Costs Your Gateway",
  metaDescription:
    "REST, GraphQL and gRPC put the routing decision in different places. That choice sets what your gateway can cache, route and rate limit before you write any code.",
  standfirst:
    "A gateway can only act on what it can read. REST puts the answer in the URL. GraphQL buries it in the body. gRPC wraps it in binary.",
  excerpt:
    "The protocol argument is usually about developer experience. The part that bites you later is what the gateway can see: caching, routing and rate limiting all follow from that.",
  authorId: "rahul-velapure",
  publishedAt: "2026-08-27",
  lastReviewedAt: "2026-08-26",
  nextReviewAt: "2027-08-26",
  readingMinutes: 5,
  primaryKeyword: "GraphQL vs REST vs gRPC performance",
  secondaryKeywords: [
    "API gateway protocol overhead",
    "gRPC protobuf serialization",
    "GraphQL N+1 problem",
    "REST API caching",
    "gRPC-Web proxy",
  ],
  tags: ["APIs", "Architecture", "GraphQL", "gRPC", "REST"],
  reviewStatus: "research-based",
  relatedSlugs: [
    "aws-vpc-lattice-vs-api-gateway-service-networking",
    "service-mesh-mtls-operational-overhead",
  ],
  methodology:
    "Written from the gRPC core concepts documentation, the gRPC-Web project documentation, the GraphQL Foundation guidance on serving over HTTP, and the Envoy gRPC-JSON transcoder reference, verified August 2026. Three corrections were made to the source draft. Its claim that Protobuf payloads run 30 to 50 percent smaller than JSON was removed, because the ratio depends entirely on payload shape. Its named gateway product was updated: Apollo Router is now the GraphOS Router, with Apollo Router Core as the open-source build. And gRPC-Web supports unary and server-streaming calls only, which the draft did not say. The draft's streaming-company incident and its load-time figures were removed as unverifiable.",
  body: [
    {
      type: "p",
      text: "Most protocol arguments are about developer experience. REST is easy to test. GraphQL gives the client the shape it asked for. gRPC gives you a typed contract. All true, and none of it is the thing that bites you later.",
    },
    {
      type: "p",
      text: "The thing that bites you is what your gateway can read. A gateway can only route, cache and rate limit on information it can see without doing expensive work.",
    },
    {
      type: "p",
      text: "Each protocol puts that information somewhere different. REST puts it in the URL. GraphQL puts it in the request body. gRPC wraps it in binary. Everything downstream follows from that one difference.",
    },
    { type: "h2", id: "rest", text: "REST: the answer is in the URL" },
    {
      type: "p",
      text: "A REST request carries its intent in the method and the path. A gateway reads both from the first line of the request. It never has to open the body.",
    },
    {
      type: "p",
      text: "That is why REST gateways are fast and boring. Routing is a path match. Rate limiting keys off the path, the client IP or an API key. Caching is the built-in HTTP kind, driven by `Cache-Control`, `ETag` and `Last-Modified`. A CDN can do it without knowing anything about your application.",
    },
    {
      type: "p",
      text: "The cost is the rigid contract. A mobile screen that needs a profile and the last three orders either makes two calls or accepts a response full of fields it will throw away. The first adds a round trip. The second wastes bandwidth and backend CPU.",
    },
    { type: "h2", id: "graphql", text: "GraphQL: the answer moves into the body" },
    {
      type: "p",
      text: "GraphQL fixes the shape problem. The client describes exactly what it wants, and the server returns that and nothing else.",
    },
    {
      type: "p",
      text: "It also moves the operation name out of the URL. Every request is a POST to one endpoint. The path is the same every time, so path-based routing tells the gateway nothing.",
    },
    {
      type: "p",
      text: "To rate limit one operation differently from another, the gateway has to parse the query document and read the operation out of it. That parse happens on every request, in the hot path.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Parsing is also the attack surface",
      text: "A deeply nested query costs the server far more than it costs the client to send. Depth limiting and complexity scoring are the standard defences. Both add work to every request, including the legitimate ones. Persisted queries avoid the problem differently: the client registers its queries ahead of time and sends a hash, so the server never executes anything it has not already seen.",
    },
    {
      type: "p",
      text: "HTTP caching mostly stops working. The method is POST and the response depends on the body, so a CDN has nothing stable to key on. Caching moves into the application: a normalised client cache, a server-side batching layer, or persisted queries you can cache by hash.",
    },
    {
      type: "h3",
      id: "n-plus-one",
      text: "The N+1 problem is an implementation bug, not a protocol flaw",
    },
    {
      type: "p",
      text: "Ask for a user and their fifty friends. A naive resolver runs one query for the user, then fifty more for the friends.",
    },
    {
      type: "p",
      text: "Nothing in GraphQL requires that. The protocol makes it easy to hit, because a client can request a nested shape the backend never planned for. The fix is a batching layer. It collects the fifty lookups within a tick and issues one query instead. DataLoader is the common implementation. Without it, GraphQL will make your database slower than REST did.",
    },
    { type: "h2", id: "grpc", text: "gRPC: efficient, and unreadable in transit" },
    {
      type: "p",
      text: "gRPC drops JSON and HTTP/1.1 together. It runs on HTTP/2 and serialises with Protocol Buffers. Both sides share a `.proto` file that defines the methods and the message types.",
    },
    {
      type: "p",
      text: "The wins are real. Binary encoding is cheaper to produce and parse than JSON. HTTP/2 multiplexes many concurrent calls over one TCP connection, so you stop paying for handshakes and stop queueing behind a slow response. How much smaller the payload gets depends on your data, so measure it rather than quoting a ratio.",
    },
    {
      type: "p",
      text: "The cost is reach. Browsers cannot speak gRPC directly, so they use gRPC-Web and a translating proxy. That translation is not free in features. gRPC-Web handles unary and server-streaming calls. It does not support client-streaming or bidirectional streaming.",
    },
    {
      type: "p",
      text: "Your gateway has the same problem in a different form. A Protobuf message is opaque without the schema. Inspecting, logging or rewriting a field means loading the `.proto` and deserialising. The gateway now has a build-time dependency on the services behind it.",
    },
    {
      type: "p",
      text: "That is why gRPC usually lives inside the estate. A REST or GraphQL edge faces outward, and the internal hops speak gRPC. Envoy sits between them and does gRPC-JSON transcoding: JSON in, Protobuf out, and the reverse on the way back.",
    },
    { type: "h2", id: "gateway", text: "What each one demands of the gateway" },
    {
      type: "table",
      caption: "The gateway work each protocol requires, and where it happens.",
      head: ["Concern", "REST", "GraphQL", "gRPC"],
      rows: [
        [
          "Routing key",
          "Method and path",
          "Operation, parsed from the body",
          "HTTP/2 path plus schema",
        ],
        ["HTTP caching", "Native, CDN-friendly", "Effectively unavailable", "Not applicable"],
        ["Rate limiting", "Path or key", "Needs query parsing", "Method-level, needs schema"],
        ["Payload inspection", "Plain JSON", "Plain JSON", "Requires the `.proto`"],
        ["Browser support", "Native", "Native", "gRPC-Web and a proxy"],
        ["Typical product", "NGINX, Kong, cloud gateways", "GraphOS Router, GraphQL Mesh", "Envoy"],
      ],
    },
    {
      type: "p",
      text: "The middle column is the one teams underestimate. A GraphQL edge is not a reverse proxy with a plugin. It validates against a schema, plans the query, splits it across subgraphs and enforces complexity limits. The GraphOS Router does this job, and Apollo Router Core is the open-source build of the same engine.",
    },
    { type: "h2", id: "mixing", text: "Most mature estates run all three" },
    {
      type: "p",
      text: "The protocols are not competing for one slot. They answer different questions, and a large system asks all of them.",
    },
    {
      type: "ul",
      items: [
        "**gRPC inside.** Service-to-service calls, where both ends are yours and throughput matters.",
        "**GraphQL at the aggregation layer.** Screens that pull from several domains at once, where round trips are the bottleneck.",
        "**REST at the public edge.** Third-party integrations, and anything static enough that a CDN should answer it instead of your servers.",
      ],
    },
    {
      type: "p",
      text: "The mistake is putting flexible data-fetching in front of data that never changes. If a feed is identical for every reader for ten minutes, a cached REST endpoint answers it at the CDN and your servers never see the request. Route it through GraphQL and every refresh reaches your origin.",
    },
    {
      type: "p",
      text: "Where those calls cross a cluster boundary, the transport decision meets the network one. The cost of running mTLS between services is covered in [service mesh mTLS overhead](/devops/service-mesh-mtls-operational-overhead), and the routing layer itself in [VPC Lattice versus API Gateway](/cloud/aws-vpc-lattice-vs-api-gateway-service-networking).",
    },
  ],
  faq: [
    {
      question: "Should I expose gRPC to public clients?",
      answer:
        "Usually not. Browsers need gRPC-Web and a proxy, and third parties expect JSON. Keep gRPC for internal hops. Put REST or GraphQL at the edge.",
    },
    {
      question: "How do I stop a GraphQL query from taking the server down?",
      answer:
        "Use three limits together. Cap how deeply a query may nest. Score each field and reject queries above a total cost. Best of all, accept only persisted queries, so the server runs nothing new.",
    },
    {
      question: "Is gRPC always faster than REST?",
      answer:
        "No. It wins on large payloads and high call rates. For one small object over a warm connection, the gap can vanish. Measure your own traffic.",
    },
    {
      question: "Does GraphQL cause the N+1 problem?",
      answer:
        "Not by itself. Your resolvers do. GraphQL just makes it easy to ask for a nested shape. Batch the lookups with DataLoader or something like it.",
    },
    {
      question: "Can a normal API gateway sit in front of GraphQL?",
      answer:
        "For TLS and rough rate limits, yes. It cannot route or cache by operation, because that means parsing the body. You need a router that speaks GraphQL.",
    },
    {
      question: "What does gRPC-Web not support?",
      answer:
        "Two of its four call types are missing. You cannot use client-streaming. You cannot use bidirectional streaming. What you get is unary calls, plus server-streaming. It also needs a proxy such as Envoy in the path.",
    },
  ],
  sources: [
    {
      title: "Core concepts, architecture and lifecycle",
      publisher: "gRPC",
      url: "https://grpc.io/docs/what-is-grpc/core-concepts/",
    },
    {
      title: "gRPC-Web",
      publisher: "gRPC",
      url: "https://github.com/grpc/grpc-web",
    },
    {
      title: "Serving over HTTP",
      publisher: "GraphQL Foundation",
      url: "https://graphql.org/learn/serving-over-http/",
    },
    {
      title: "gRPC-JSON transcoder filter",
      publisher: "Envoy Proxy",
      url: "https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/grpc_json_transcoder_filter",
    },
    {
      title: "Does the GraphOS Router replace my API gateway?",
      publisher: "Apollo GraphQL",
      url: "https://www.apollographql.com/docs/graphos/routing/router-api-gateway-comparison",
    },
  ],
};
