// Questions for topic 'services'. Loaded by index.html before js/questions.js,
// which concatenates all Q_* arrays into the global QUESTIONS.

const Q_SERVICES = [
  {
    id: 'me6-3',
    topic: 'services',
    difficulty: 'fail',
    title: 'ClusterIP service with shared label selectors; list all pod IPs sorted',
    scenario: `On <code>cluster2</code>. Two parts:<br><br>
<strong>Part I:</strong> Several pods exist in the default namespace. Create a ClusterIP service named <code>radioactive-service</code> exposing pods <code>beta</code> and <code>gamma</code> only. Port <code>8080</code>, targetPort <code>80</code>. Identify the labels that are common to beta and gamma (not shared by others) and use those as selectors.<br><br>
<strong>Part II:</strong> Store the pod name and IP of <strong>all pods across all namespaces</strong> to <code>/root/pod_ips_ckad02_svcn</code>, sorted by IP. Format:<br><code>POD_NAME&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;IP_ADDR</code>`,
    hint: {
      url: 'https://kubernetes.io/docs/concepts/services-networking/service/',
      path: 'Concepts → Services, LB & Networking → Service',
      tip: "Part I: kubectl get pods --show-labels, find labels UNIQUE to beta+gamma. Then kubectl create service clusterip radioactive-service --tcp=8080:80 --dry-run=client -o yaml > svc.yaml, edit the selector, apply. Part II: kubectl get pods -A -o=custom-columns='POD_NAME:metadata.name,IP_ADDR:status.podIP' --sort-by=.status.podIP"
    },
    answer: {
      explanation: '<code>kubectl get pods --show-labels</code> shows beta and gamma share <code>mode=exam,type=external</code>. Dry-run the service YAML, edit the selector, apply. Part II: <code>custom-columns</code> with <code>--sort-by</code>.',
      yaml: `# === Part I ===
kubectl config use-context cluster2

# Find the discriminating labels for beta + gamma only:
kubectl get pods --show-labels
# beta:  env=dev,mode=exam,type=external
# gamma: env=prod,mode=exam,type=external
# Common unique labels: mode=exam,type=external

# Confirm only those two pods match:
kubectl get pods -l mode=exam,type=external

# Generate service YAML:
kubectl create service clusterip radioactive-service \\
  --tcp=8080:80 --dry-run=client -o yaml > radioactive-service.yaml

# Edit radioactive-service.yaml, change selector to:
#   selector:
#     mode: exam       # replaces default app: radioactive-service
#     type: external

kubectl apply -f radioactive-service.yaml

# Verify endpoints (should show 2 pod IPs):
kubectl get ep radioactive-service

# === Part II ===
kubectl get pods -A \\
  -o=custom-columns='POD_NAME:metadata.name,IP_ADDR:status.podIP' \\
  --sort-by=.status.podIP > /root/pod_ips_ckad02_svcn`
    }
  }
];
