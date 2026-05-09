// Questions for topic 'cka-etcd'. Loaded by index.html before js/questions.js,
// which concatenates all Q_* arrays into the global QUESTIONS.

const Q_CKA_ETCD = [
  {
    id: 'cka-etcd-1',
    topic: 'cka-etcd',
    difficulty: 'fail',
    title: 'Backup etcd to /opt/etcd-backup.db on the controlplane',
    scenario: 'Take a snapshot backup of etcd at <code>/opt/etcd-backup.db</code> on the controlplane node using <code>etcdctl</code> v3 API. The TLS certs live under <code>/etc/kubernetes/pki/etcd/</code>.',
    hint: {
      url: 'https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/#backing-up-an-etcd-cluster',
      path: 'Tasks → Administer a Cluster → Operating etcd → Backing up an etcd cluster',
      tip: 'Search "backup etcd cluster", copy the snapshot save command. The exam wants: ETCDCTL_API=3 etcdctl snapshot save <path> --endpoints --cacert --cert --key. If unsure of cert paths, look in /etc/kubernetes/manifests/etcd.yaml.'
    },
    answer: {
      explanation: '<span class="highlight">Memorize this one-liner.</span> All three TLS flags are mandatory or the snapshot save hangs. The cert paths come from the etcd static pod manifest.',
      yaml: `# Always set v3 API
export ETCDCTL_API=3

# Snapshot save (the one-liner to memorize):
etcdctl snapshot save /opt/etcd-backup.db \\
  --endpoints=127.0.0.1:2379 \\
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\
  --cert=/etc/kubernetes/pki/etcd/server.crt \\
  --key=/etc/kubernetes/pki/etcd/server.key

# Verify the snapshot
etcdctl --write-out=table snapshot status /opt/etcd-backup.db

# If you don't know the cert paths, find them in the manifest:
grep -E '(cert|key|ca)-file' /etc/kubernetes/manifests/etcd.yaml`
    }
  },
  {
    id: 'cka-etcd-2',
    topic: 'cka-etcd',
    difficulty: 'hard',
    title: 'Restore etcd from a snapshot to a new data dir',
    scenario: 'An etcd snapshot exists at <code>/opt/snapshot.db</code>. Restore it into <code>/var/lib/etcd-from-backup</code>, then update the static pod manifest at <code>/etc/kubernetes/manifests/etcd.yaml</code> so etcd uses the restored data. Verify cluster recovers.',
    hint: {
      url: 'https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/#restoring-an-etcd-cluster',
      path: 'Tasks → Administer a Cluster → Operating etcd → Restoring an etcd cluster',
      tip: 'Two parts: (1) etcdctl snapshot restore --data-dir=<new-dir> creates the dir. (2) Edit /etc/kubernetes/manifests/etcd.yaml, change BOTH the --data-dir command arg AND the volumes.hostPath.path that mounts /var/lib/etcd. The kubelet auto-restarts the pod when the manifest changes.'
    },
    answer: {
      explanation: 'Two locations to update in the manifest: the <code>--data-dir</code> arg AND the <code>hostPath</code> volume. Miss either one and etcd reads the wrong data.',
      yaml: `# 1. Restore the snapshot to a new data dir
ETCDCTL_API=3 etcdctl snapshot restore /opt/snapshot.db \\
  --data-dir=/var/lib/etcd-from-backup

# 2. Edit the static pod manifest
vi /etc/kubernetes/manifests/etcd.yaml

# Update TWO places:
#   spec:
#     containers:
#     - command:
#       - etcd
#       - --data-dir=/var/lib/etcd-from-backup    <-- (was /var/lib/etcd)
#     volumes:
#     - hostPath:
#         path: /var/lib/etcd-from-backup         <-- (was /var/lib/etcd)
#         type: DirectoryOrCreate
#       name: etcd-data

# 3. Kubelet detects the change and restarts etcd
# Wait ~30s, then verify:
kubectl get pods -n kube-system | grep etcd
kubectl get nodes`
    }
  },
  {
    id: 'cka-etcd-3',
    topic: 'cka-etcd',
    difficulty: 'medium',
    title: 'Find the current etcd data dir + cert paths from a running cluster',
    scenario: "You SSH into a brand new cluster's controlplane and need to back up etcd, but you don't know its data dir or cert locations. Find both, then take a snapshot to <code>/opt/cluster-backup.db</code>.",
    hint: {
      url: 'https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/#backing-up-an-etcd-cluster',
      path: 'Tasks → Administer a Cluster → Operating etcd',
      tip: 'For kubeadm clusters, etcd runs as a static pod, its config lives in /etc/kubernetes/manifests/etcd.yaml. grep for "data-dir", "cert-file", "key-file", "trusted-ca-file" to extract every path.'
    },
    answer: {
      explanation: "Always find paths from the live manifest, on't assume defaults. Different distros put certs in different places.",
      yaml: `# Inspect the running etcd static pod manifest
cat /etc/kubernetes/manifests/etcd.yaml | grep -E '(data-dir|cert-file|key-file|trusted-ca-file|listen-client-urls)'

# Typical output (kubeadm):
#   --cert-file=/etc/kubernetes/pki/etcd/server.crt
#   --key-file=/etc/kubernetes/pki/etcd/server.key
#   --trusted-ca-file=/etc/kubernetes/pki/etcd/ca.crt
#   --data-dir=/var/lib/etcd
#   --listen-client-urls=https://127.0.0.1:2379, ttps://10.x.x.x:2379

# Take the snapshot
ETCDCTL_API=3 etcdctl snapshot save /opt/cluster-backup.db \\
  --endpoints=127.0.0.1:2379 \\
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\
  --cert=/etc/kubernetes/pki/etcd/server.crt \\
  --key=/etc/kubernetes/pki/etcd/server.key`
    }
  }
];
