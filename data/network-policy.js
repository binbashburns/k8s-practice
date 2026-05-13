// Questions for topic 'network-policy'. Loaded by index.html before js/questions.js,
// which concatenates all Q_* arrays into the global QUESTIONS.

const Q_NETWORK_POLICY = [
  {
    id: 'np-1',
    topic: 'network-policy',
    difficulty: 'fail',
    title: 'Fix failed connectivity: allow webapp-color → secure-pod on TCP 80',
    scenario: 'A <code>default-deny</code> NetworkPolicy exists in the <code>default</code> namespace. Pods named <code>secure-pod</code> (label <code>run: secure-pod</code>) cannot receive traffic. Create a NetworkPolicy that allows the pod <code>webapp-color</code> (label <code>name: webapp-color</code>) to reach <code>secure-pod</code> on TCP port 80. Do NOT delete the existing policy.',
    hint: {
      url: 'https://kubernetes.io/docs/concepts/services-networking/network-policies/',
      path: 'Concepts → Services, LB & Networking → Network Policies',
      tip: 'Find the "podSelector" + "ingress.from.podSelector" example. The key is spec.podSelector (who this applies to) vs ingress.from.podSelector (who is allowed in).'
    },
    answer: {
      explanation: 'The existing default-deny blocks everything. <span class="highlight">Add</span> a new allow policy, never delete the deny. The podSelector targets secure-pod; ingress.from.podSelector allows webapp-color.',
      yaml: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-webapp-to-secure
  namespace: default
spec:
  podSelector:
    matchLabels:
      run: secure-pod        # THIS policy applies to pods with this label
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          name: webapp-color # allow traffic FROM pods with this label
    ports:
    - protocol: TCP
      port: 80`
    }
  },
  {
    id: 'np-2',
    topic: 'network-policy',
    difficulty: 'hard',
    title: 'Edit existing NetworkPolicy to add a new allowed source',
    scenario: 'A NetworkPolicy <code>netpol-ckad13-svcn</code> already allows ingress from pods with label <code>tier: server</code>. Edit it to ALSO allow ingress from pods with label <code>access: allowed</code>. Do not change or remove the existing rule.',
    hint: {
      url: 'https://kubernetes.io/docs/concepts/services-networking/network-policies/#networkpolicy-resource',
      path: 'Concepts → Network Policies → NetworkPolicy resource',
      tip: 'In the ingress.from list, each separate dash (-) item is an OR condition. Add a new - podSelector item to add another allowed source.'
    },
    answer: {
      explanation: 'In the <code>ingress.from</code> list, items at the same dash level are OR conditions. Just add a second <code>- podSelector</code> entry.',
      yaml: `spec:
  podSelector:
    matchLabels:
      app: kk-app
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          tier: server         # existing rule, do not remove
    - podSelector:             # ADD THIS (OR condition)
        matchLabels:
          access: allowed`
    }
  },
  {
    id: 'np-3',
    topic: 'network-policy',
    difficulty: 'medium',
    title: 'Create NetworkPolicy: allow only pods with label access=redis to reach a Redis deployment on port 6379',
    scenario: 'A <code>redis</code> Deployment (label <code>app: redis</code>) exists. Create a NetworkPolicy named <code>redis-access</code> that allows only pods with label <code>access: redis</code> to reach it on TCP 6379. All other ingress to Redis pods should be blocked.',
    hint: {
      url: 'https://kubernetes.io/docs/concepts/services-networking/network-policies/',
      path: 'Concepts → Network Policies',
      tip: 'podSelector on the policy = which pods are protected (app: redis). ingress.from.podSelector = who can reach them (access: redis). policyTypes must include Ingress.'
    },
    answer: {
      explanation: "The policy's podSelector must match the Redis pods (app: redis, NOT role: redis, check the actual pod labels). The ingress from rule uses access: redis.",
      yaml: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: redis-access
  namespace: default
spec:
  podSelector:
    matchLabels:
      app: redis             # protects pods with this label
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          access: redis      # only these pods can connect
    ports:
    - protocol: TCP
      port: 6379`
    }
  },
  {
    id: 'np-4',
    topic: 'network-policy',
    difficulty: 'hard',
    title: 'Add Egress rule allowing DNS but not breaking existing ingress',
    scenario: 'Pods with label <code>app: backend</code> need to reach a database (label <code>app: db</code>) on port 5432. Add an Egress NetworkPolicy. Make sure pods can still resolve DNS (UDP/TCP port 53).',
    hint: {
      url: 'https://kubernetes.io/docs/concepts/services-networking/network-policies/#egress',
      path: 'Concepts → Network Policies → Egress section',
      tip: 'Add TWO egress rules: one to the DB pod on 5432, and one with no podSelector but ports: [{port: 53, protocol: UDP}] for DNS. Without the DNS rule, pods cannot resolve service names.'
    },
    answer: {
      explanation: '<span class="highlight">DNS trap:</span> Once you add an Egress policyType, ALL egress is blocked except what you explicitly allow. Always add UDP 53 for DNS.',
      yaml: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-egress
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Egress
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: db
    ports:
    - protocol: TCP
      port: 5432
  - ports:               # Allow DNS, LWAYS include this!
    - protocol: UDP
      port: 53
    - protocol: TCP
      port: 53`
    }
  },
  {
    id: 'me6-2',
    topic: 'network-policy',
    difficulty: 'fail',
    title: 'Troubleshoot: service selector mismatch + overly restrictive egress NetworkPolicy',
    scenario: `In namespace <code>ns-new-ckad</code> on <code>cluster3</code>, two issues exist:<br><br>
<strong>Issue 1:</strong> <code>backend-ckad-svcn</code> cannot reach backend pods. Inspect and fix the service selector.<br>
<strong>Issue 2:</strong> <code>frontend-ckad-svcn</code> is not accessible from backend pods. A NetworkPolicy <code>backend-egress-restricted</code> is blocking traffic, fix it so backends can reach all egress destinations (not just frontend).`,
    hint: {
      url: 'https://kubernetes.io/docs/concepts/services-networking/network-policies/#egress',
      path: 'Concepts → Network Policies → Egress',
      tip: 'For Issue 1: kubectl describe svc backend-ckad-svcn, compare selector labels to actual pod labels (kubectl get pods --show-labels). For Issue 2: kubectl edit netpol backend-egress-restricted, replace the restrictive "to:" egress rule with an empty {} to allow all egress.'
    },
    answer: {
      explanation: '<span class="highlight">Issue 1:</span> Service selector used <code>app: back-end, tier: ckadexam</code> but pods have <code>app: backend, tier: ckad-exam</code>. Fix with kubectl edit svc. <span class="highlight">Issue 2:</span> Replace the to: podSelector egress rule with an empty <code>- {}</code> to allow all egress.',
      yaml: `# === Issue 1: Fix service selector ===
kubectl -n ns-new-ckad describe svc backend-ckad-svcn
# Selector shows: app=back-end, ier=ckadexam  ← WRONG
kubectl -n ns-new-ckad get pods --show-labels
# Pods have: app=backend, ier=ckad-exam

kubectl -n ns-new-ckad edit svc backend-ckad-svcn
# Change selector to:
#   selector:
#     app: backend      # match actual pod label
#     tier: ckad-exam   # match actual pod label

# Verify:
kubectl -n ns-new-ckad exec testpod -- curl backend-ckad-svcn

# === Issue 2: Fix egress NetworkPolicy ===
kubectl -n ns-new-ckad edit netpol backend-egress-restricted
# Replace the restrictive egress block:
#   egress:
#   - to:
#     - podSelector:
#         matchLabels:
#           app: frontend
#           tier: ckad-exam
# With a permissive allow-all:
#   egress:
#   - {}   # allow ALL egress`
    }
  },
  {
    id: 'np-5',
    topic: 'network-policy',
    difficulty: 'medium',
    title: 'Allow ingress from all sources to np-test-1 on port 80 (default-deny stays)',
    scenario: 'In <code>default</code>, pod <code>np-test-1</code> and service <code>np-test-service</code> exist. A default-deny NetworkPolicy is blocking ingress. Create a NetworkPolicy <code>ingress-to-nptest</code> that allows ingress to <code>np-test-1</code> on TCP 80 from any source. <strong>Do not delete the default-deny.</strong>',
    hint: {
      url: 'https://kubernetes.io/docs/concepts/services-networking/network-policies/',
      path: 'Concepts → Services, LB & Networking → Network Policies',
      tip: 'An ingress rule with ports but no from: matches all sources. podSelector targets the pod by label (kubectl get pod np-test-1 --show-labels to find the right key). NetworkPolicies are additive, the default-deny stays in place.'
    },
    answer: {
      explanation: 'Omitting <code>from:</code> under <code>ingress[]</code> means "from anywhere"; the <code>ports</code> list still constrains to TCP 80. The default-deny is unaffected, both policies apply.',
      yaml: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ingress-to-nptest
  namespace: default
spec:
  podSelector:
    matchLabels:
      run: np-test-1
  policyTypes:
  - Ingress
  ingress:
  - ports:                # no "from:" = allow from anywhere
    - protocol: TCP
      port: 80

# Verify reachability
kubectl run test-conn --image=busybox --restart=Never --rm -it -- \\
  wget -qO- -T 5 http://np-test-service`
    }
  }
];
