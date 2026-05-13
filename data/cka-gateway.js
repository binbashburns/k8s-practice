// Questions for topic 'cka-gateway'. Loaded by index.html before js/questions.js,
// which concatenates all Q_* arrays into the global QUESTIONS.

const Q_CKA_GATEWAY = [
  {
    id: 'cka-gw-1',
    topic: 'cka-gateway',
    difficulty: 'medium',
    title: 'Create a Gateway with HTTP listener on port 80',
    scenario: 'Create a Gateway resource:<br>• name: <code>web-gateway</code><br>• namespace: <code>nginx-gateway</code><br>• gatewayClassName: <code>nginx</code><br>• Listener: protocol HTTP, port 80, name <code>http</code>',
    hint: {
      url: 'https://gateway-api.sigs.k8s.io/api-types/gateway/',
      path: 'gateway-api.sigs.k8s.io → API Types → Gateway',
      tip: 'apiVersion: gateway.networking.k8s.io/v1. Gateway has spec.gatewayClassName + spec.listeners[]. A listener needs name, protocol, port (and tls/hostname when needed).'
    },
    answer: {
      explanation: 'Minimal Gateway: a class name and one listener. Each listener needs a unique <code>name</code>.',
      yaml: `apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: web-gateway
  namespace: nginx-gateway
spec:
  gatewayClassName: nginx
  listeners:
  - name: http
    protocol: HTTP
    port: 80

# Apply and verify the gateway is ACCEPTED
kubectl apply -f gateway.yaml
kubectl get gateway -n nginx-gateway
kubectl describe gateway web-gateway -n nginx-gateway`
    }
  },
  {
    id: 'cka-gw-2',
    topic: 'cka-gateway',
    difficulty: 'hard',
    title: 'Convert HTTP Gateway to HTTPS on 443 with TLS for kodekloud.com',
    scenario: 'An existing Gateway <code>web-gateway</code> in namespace <code>cka5673</code> currently listens on port 80 (HTTP). Modify it to listen on 443 with HTTPS for hostname <code>kodekloud.com</code>, using TLS cert from secret <code>kodekloud-tls</code>.',
    hint: {
      url: 'https://gateway-api.sigs.k8s.io/guides/tls/',
      path: 'gateway-api.sigs.k8s.io → Guides → TLS',
      tip: 'Replace the listener entirely: protocol HTTPS, port 443, hostname, and tls.certificateRefs[].name pointing at the secret. tls.mode defaults to Terminate (which is what you want).'
    },
    answer: {
      explanation: 'For HTTPS termination, the listener needs <code>protocol: HTTPS</code>, <code>port: 443</code>, <code>hostname</code>, and <code>tls.certificateRefs</code>. The secret must be a <code>kubernetes.io/tls</code> secret in the same namespace as the Gateway (or referenced cross-namespace via ReferenceGrant).',
      yaml: `apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: web-gateway
  namespace: cka5673
spec:
  gatewayClassName: nginx
  listeners:
  - name: https
    protocol: HTTPS
    port: 443
    hostname: kodekloud.com
    tls:
      certificateRefs:
      - name: kodekloud-tls       # must be in same ns or use ReferenceGrant

# Apply
kubectl apply -f web-gateway.yaml

# Verify
kubectl get gateway -n cka5673 web-gateway -o yaml | grep -A6 listeners`
    }
  },
  {
    id: 'cka-gw-3',
    topic: 'cka-gateway',
    difficulty: 'medium',
    title: 'HTTPRoute weighted split: 80% to web-service, 20% to web-service-v2',
    scenario: 'A Gateway <code>web-gateway</code> and Services <code>web-service</code> and <code>web-service-v2</code> already exist in <code>default</code>. Create HTTPRoute <code>web-route</code> in <code>default</code> attached to <code>web-gateway</code>: traffic at path <code>/</code> splits 80/20 between <code>web-service</code> and <code>web-service-v2</code> (both on port 80).',
    hint: {
      url: 'https://kubernetes.io/docs/concepts/services-networking/gateway/',
      path: 'Concepts → Services, LB & Networking → Gateway API',
      tip: 'Multiple backendRefs under one rule each carry a weight; the controller normalises weights to produce the split. parentRefs binds the route to the Gateway. apiVersion: gateway.networking.k8s.io/v1 (not networking.k8s.io).'
    },
    answer: {
      explanation: 'Weighted backends live under a single <code>rules[]</code> entry with two <code>backendRefs</code>. Weights do not need to sum to 100, the controller normalises them, but 80 + 20 makes the intent obvious.',
      yaml: `apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: web-route
  namespace: default
spec:
  parentRefs:
  - name: web-gateway
    namespace: default
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /
    backendRefs:
    - name: web-service
      port: 80
      weight: 80
    - name: web-service-v2
      port: 80
      weight: 20

# Apply and inspect
kubectl apply -f web-route.yaml
kubectl describe httproute web-route -n default`
    }
  }
];
