// Questions for topic 'cka-cni'. Loaded by index.html before js/questions.js,
// which concatenates all Q_* arrays into the global QUESTIONS.

const Q_CKA_CNI = [
  {
    id: 'cka-cni-1',
    topic: 'cka-cni',
    difficulty: 'hard',
    title: 'Install Calico CNI with a custom pod CIDR (172.17.0.0/16)',
    scenario: 'Install Calico on a fresh cluster using the tigera operator. Override the default IP pool to use CIDR <code>172.17.0.0/16</code>. Verify pods can communicate after install.',
    hint: {
      url: 'https://docs.tigera.io/calico/latest/getting-started/kubernetes/quickstart',
      path: 'docs.tigera.io → Calico → Quickstart for Kubernetes',
      tip: 'Two manifests: tigera-operator.yaml (the operator itself) + custom-resources.yaml (the Installation CR with your CIDR). Use kubectl create (NOT apply) on tigera-operator.yaml, apply hits a 262144-byte annotation limit. Edit the CIDR in custom-resources.yaml before applying.'
    },
    answer: {
      explanation: `<span class="highlight">The "kubectl apply" trap:</span> tigera-operator.yaml has a CRD with annotations that exceed apply's 262144-byte limit. Use <code>kubectl create -f</code> instead.`,
      yaml: `# 1. Install the operator (use create, not apply)
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.29.2/manifests/tigera-operator.yaml

# 2. Download the Installation CR
curl -O https://raw.githubusercontent.com/projectcalico/calico/v3.29.2/manifests/custom-resources.yaml

# 3. Edit custom-resources.yaml, change the cidr:
# spec:
#   calicoNetwork:
#     ipPools:
#     - name: default-ipv4-ippool
#       blockSize: 26
#       cidr: 172.17.0.0/16              <-- CHANGE THIS
#       encapsulation: VXLANCrossSubnet
#       natOutgoing: Enabled
#       nodeSelector: all()

# 4. Apply the Installation CR (this one is small, apply works)
kubectl create -f custom-resources.yaml

# 5. Watch Calico come up (takes 1-2 minutes)
watch kubectl get pods -n calico-system

# 6. Test pod-to-pod
kubectl run web --image=nginx
WEB_IP=$(kubectl get pod web -o jsonpath='{.status.podIP}')
kubectl run test --rm -it --image=nicolaka/netshoot --restart=Never -- curl $WEB_IP`
    }
  }
];
