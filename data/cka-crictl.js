// Questions for topic 'cka-crictl'. Loaded by index.html before js/questions.js,
// which concatenates all Q_* arrays into the global QUESTIONS.

const Q_CKA_CRICTL = [
  {
    id: 'cka-crictl-1',
    topic: 'cka-crictl',
    difficulty: 'medium',
    title: 'Find which container is consuming the most resources on a node',
    scenario: 'On <code>cluster1-node01</code>, kubectl is unavailable. Use crictl to list every running container, then identify the one image with the most container instances. Save the image name to <code>/root/most-used-image.txt</code> on the node.',
    hint: {
      url: 'https://kubernetes.io/docs/tasks/debug/debug-cluster/crictl/',
      path: 'Tasks → Debug → Debugging Kubernetes nodes with crictl',
      tip: 'crictl ps lists running containers with their IMAGE column. Pipe through awk to extract that column, then sort | uniq -c | sort -rn to count duplicates. The first line is the most-used image.'
    },
    answer: {
      explanation: 'crictl is the runtime-side equivalent of <code>docker ps</code>. The <code>IMAGE</code> column in <code>crictl ps</code> output is what you want.',
      yaml: `# 1. List all running containers
sudo crictl ps

# 2. Extract the IMAGE column, count duplicates, sort descending
sudo crictl ps --output json \\
  | jq -r '.containers[].image' \\
  | sort | uniq -c | sort -rn \\
  | head -1

# Or without jq, parse the table:
sudo crictl ps | awk 'NR>1 {print $2":"$3}' | sort | uniq -c | sort -rn | head -1

# 3. Save the image name (drop the count column)
echo 'registry.k8s.io/kube-proxy:v1.32.0' | sudo tee /root/most-used-image.txt`
    }
  },
  {
    id: 'cka-crictl-2',
    topic: 'cka-crictl',
    difficulty: 'hard',
    title: 'Static pod nginx-static fails to start, diagnose with crictl + journalctl',
    scenario: "A static pod manifest <code>nginx-static.yaml</code> exists in <code>/etc/kubernetes/manifests/</code> on <code>controlplane</code>, but the mirror pod never appears in <code>kubectl get pods -A</code>. Use crictl and the kubelet logs to find why the kubelet isn't starting it. Apply the fix and confirm the pod runs.",
    hint: {
      url: 'https://kubernetes.io/docs/tasks/configure-pod-container/static-pod/',
      path: 'Tasks → Configure Pods and Containers → Create static Pods',
      tip: 'Walk: (1) journalctl -u kubelet -f to watch live as you edit the manifest. (2) crictl pods to see if the sandbox even tries to come up. (3) crictl ps -a to see exited container attempts. (4) crictl logs <id> for image pull failures, command typos, etc. Common causes: bad image tag, syntax error in YAML, missing static pod path.'
    },
    answer: {
      explanation: 'Static pods are kubelet-managed: the kubelet watches <code>staticPodPath</code> and creates pod sandboxes via the runtime. If the kubelet rejects the manifest (bad YAML, image typo), nothing shows up in <code>kubectl get pods</code>. crictl + journalctl are the only debugging surface.',
      yaml: `# 1. Watch kubelet decisions in real time
sudo journalctl -u kubelet -f &

# 2. Confirm the staticPodPath the kubelet actually uses
ps -ef | grep kubelet | grep -oE '\\-\\-config=[^ ]+'
# Or:
grep staticPodPath /var/lib/kubelet/config.yaml
# Default for kubeadm: /etc/kubernetes/manifests

# 3. Check pod sandboxes; even a broken static pod may have an attempted sandbox
sudo crictl pods | grep nginx-static

# 4. Check exited container attempts
sudo crictl ps -a | grep nginx-static
sudo crictl logs <container-id>     # if any container started at all

# 5. Common causes:
#   - typo in image (e.g. "ngnix:1.21" not "nginx:1.21")
#   - YAML indentation error (kubelet logs say "failed to decode")
#   - Manifest in wrong directory (not the configured staticPodPath)

# 6. Fix the manifest, save, kubelet picks it up automatically
sudo vi /etc/kubernetes/manifests/nginx-static.yaml

# 7. Verify
kubectl get pods -A | grep nginx-static     # should show as nginx-static-controlplane`
    }
  },
  {
    id: 'cka-crictl-3',
    topic: 'cka-crictl',
    difficulty: 'medium',
    title: 'Pull an image manually with crictl and pre-warm a node',
    scenario: 'Worker <code>node01</code> runs slow on first scheduling because images aren\'t cached. Pre-pull <code>nginx:1.25-alpine</code> directly on the node using crictl, then verify it lands in the runtime\'s image store.',
    hint: {
      url: 'https://kubernetes.io/docs/tasks/debug/debug-cluster/crictl/',
      path: 'Tasks → Monitoring, Logging, Debugging → Debugging nodes with crictl',
      tip: 'crictl pull <image> talks to the configured CRI endpoint and pulls into the runtime\'s image store (containerd in modern kubeadm clusters). crictl images lists the local image cache. Useful when you need to test image availability before trusting kubectl.'
    },
    answer: {
      explanation: 'Manual pre-pulling via crictl bypasses the kubelet entirely; the runtime fetches and caches the image so subsequent pod scheduling is faster. <code>crictl images</code> confirms the cache.',
      yaml: `# Pull directly into the runtime's image store
sudo crictl pull nginx:1.25-alpine

# Confirm it landed in the cache
sudo crictl images | grep nginx
# Output:
# docker.io/library/nginx     1.25-alpine     <id>     ~50MB

# Inspect image metadata (digest, size, repo tags)
sudo crictl inspecti nginx:1.25-alpine | jq .info`
    }
  }
];
