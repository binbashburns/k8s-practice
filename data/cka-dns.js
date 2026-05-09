// Questions for topic 'cka-dns'. Loaded by index.html before js/questions.js,
// which concatenates all Q_* arrays into the global QUESTIONS.

const Q_CKA_DNS = [
  {
    id: 'cka-dns-1',
    topic: 'cka-dns',
    difficulty: 'medium',
    title: 'nslookup a Service from inside the cluster, save output to a file',
    scenario: 'Create a pod <code>nginx-resolver</code> (image <code>nginx</code>), expose it as <code>nginx-resolver-service</code> (ClusterIP, port 80). From a temporary <code>busybox:1.28</code> pod, nslookup the service name and write the output to <code>/root/CKA/nginx.svc</code>. Then look up the pod by its IP and write to <code>/root/CKA/nginx.pod</code>.',
    hint: {
      url: 'https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/',
      path: 'Concepts → Services, LB & Networking → DNS for Services and Pods',
      tip: 'Use busybox:1.28 specifically; newer busybox images break nslookup against CoreDNS. Pod DNS form: <a-b-c-d>.<ns>.pod.cluster.local (dashes, not dots). kubectl run --rm -it --restart=Never for a one-shot pod.'
    },
    answer: {
      explanation: '<span class="highlight">Two gotchas:</span> (1) busybox >1.28 has a broken nslookup. (2) Pod DNS uses dashes in the IP and namespace.pod, while service uses service.namespace.svc.',
      yaml: `# 1. Create the resolver pod + ClusterIP service
kubectl run nginx-resolver --image=nginx
kubectl expose pod nginx-resolver \\
  --name=nginx-resolver-service --port=80 --target-port=80 --type=ClusterIP

# 2. Look up by service name
kubectl run test-nslookup --image=busybox:1.28 --rm -it --restart=Never \\
  -- nslookup nginx-resolver-service > /root/CKA/nginx.svc

# 3. Get the pod IP and convert dots to dashes
POD_IP=$(kubectl get pod nginx-resolver -o jsonpath='{.status.podIP}')
DASHED=$(echo $POD_IP | tr '.' '-')

# 4. Look up by pod DNS (dashed IP + .default.pod)
kubectl run test-nslookup --image=busybox:1.28 --rm -it --restart=Never \\
  -- nslookup $DASHED.default.pod > /root/CKA/nginx.pod

# DNS forms:
#   Service: <svc>.<ns>.svc.cluster.local
#   Pod:     <a-b-c-d>.<ns>.pod.cluster.local`
    }
  },
  {
    id: 'cka-dns-2',
    topic: 'cka-dns',
    difficulty: 'easy',
    title: 'Debug: pod cannot resolve service name (CoreDNS sanity check)',
    scenario: "A pod cannot resolve <code>my-service</code>. Confirm CoreDNS is healthy and the pod's <code>/etc/resolv.conf</code> points at the cluster DNS service.",
    hint: {
      url: 'https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/',
      path: 'Tasks → Administer a Cluster → Debugging DNS Resolution',
      tip: "Three checks: (1) CoreDNS pods Running in kube-system. (2) kube-dns service has endpoints. (3) Pod's /etc/resolv.conf nameserver is the kube-dns ClusterIP."
    },
    answer: {
      explanation: 'Walk the chain: CoreDNS pods → kube-dns service → pod resolv.conf. Any broken link breaks DNS.',
      yaml: `# 1. CoreDNS pods healthy?
kubectl get pods -n kube-system -l k8s-app=kube-dns
kubectl logs -n kube-system -l k8s-app=kube-dns --tail=20

# 2. kube-dns service has endpoints?
kubectl get svc -n kube-system kube-dns
kubectl get endpoints -n kube-system kube-dns

# 3. From inside any pod, what DNS server is it using?
kubectl exec <pod> -- cat /etc/resolv.conf
# Expected:
#   nameserver 10.96.0.10           # kube-dns ClusterIP
#   search default.svc.cluster.local svc.cluster.local cluster.local

# 4. Test resolution from the same pod
kubectl exec <pod> -- nslookup my-service
kubectl exec <pod> -- nslookup kubernetes.default`
    }
  }
];
