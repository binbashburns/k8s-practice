// Questions for topic 'cka-static-pod'. Loaded by index.html before js/questions.js,
// which concatenates all Q_* arrays into the global QUESTIONS.

const Q_CKA_STATIC_POD = [
  {
    id: 'cka-sp-1',
    topic: 'cka-static-pod',
    difficulty: 'hard',
    title: 'Create a static pod nginx-critical on cluster1-node01',
    scenario: 'Create a static pod called <code>nginx-critical</code> with image <code>nginx</code> on <code>cluster1-node01</code>. It must restart automatically on failure. Use <code>/etc/kubernetes/manifests</code> as the static pod path.',
    hint: {
      url: 'https://kubernetes.io/docs/tasks/configure-pod-container/static-pod/',
      path: 'Tasks → Configure Pods and Containers → Create static Pods',
      tip: 'Generate the pod YAML with --dry-run=client on the controlplane, scp it to the node, then drop it into /etc/kubernetes/manifests/. The kubelet picks it up automatically. Verify staticPodPath in /var/lib/kubelet/config.yaml. The mirror pod name will be nginx-critical-cluster1-node01.'
    },
    answer: {
      explanation: `Static pods are managed directly by the kubelet on the node, ot the API server. The kubelet creates a "mirror pod" in the API for visibility. Filename in <code>/etc/kubernetes/manifests/</code> doesn't have to match the pod name.`,
      yaml: `# 1. Generate the pod YAML on the controlplane
kubectl run nginx-critical --image=nginx \\
  --dry-run=client -o yaml > static.yaml

# 2. Copy to the node
scp static.yaml cluster1-node01:/root/

# 3. SSH to the node
ssh cluster1-node01

# 4. (If needed) confirm kubelet's staticPodPath
grep staticPodPath /var/lib/kubelet/config.yaml
# Expected: staticPodPath: /etc/kubernetes/manifests

# 5. Move the manifest into the static pod dir
sudo mkdir -p /etc/kubernetes/manifests
sudo cp /root/static.yaml /etc/kubernetes/manifests/

# 6. Verify (back on controlplane)
exit
kubectl get pods -A | grep nginx-critical
# Mirror pod name: nginx-critical-cluster1-node01`
    }
  },
  {
    id: 'cka-sp-2',
    topic: 'cka-static-pod',
    difficulty: 'easy',
    title: 'Find the staticPodPath on a node and list all static pods',
    scenario: "On a node, find which directory is configured as the kubelet's static pod path, then list every static pod manifest in it.",
    hint: {
      url: 'https://kubernetes.io/docs/tasks/configure-pod-container/static-pod/',
      path: 'Tasks → Configure Pods → Create static Pods',
      tip: 'Two places to check: (1) /var/lib/kubelet/config.yaml has staticPodPath. (2) systemd unit overrides may pass --pod-manifest-dir. ps -ef | grep kubelet shows the actual flags being used.'
    },
    answer: {
      explanation: 'Always confirm via the running kubelet process, the config file may be overridden.',
      yaml: `# Method 1: kubelet config file
grep staticPodPath /var/lib/kubelet/config.yaml

# Method 2: running process flags (shows overrides)
ps -ef | grep kubelet | grep -oE 'pod-manifest-dir[^ ]+'
# or
systemctl cat kubelet | grep -i manifest

# List the static pod manifests
ls -la /etc/kubernetes/manifests/
# kube-apiserver.yaml, kube-controller-manager.yaml, kube-scheduler.yaml, etcd.yaml`
    }
  }
];
