// Questions for topic 'cka-troubleshoot'. Loaded by index.html before js/questions.js,
// which concatenates all Q_* arrays into the global QUESTIONS.

const Q_CKA_TROUBLESHOOT = [
  {
    id: 'cka-ts-1',
    topic: 'cka-troubleshoot',
    difficulty: 'medium',
    title: 'Fix kubeconfig: server URL has wrong port',
    scenario: "<code>/root/CKA/admin.kubeconfig</code> exists but kubectl fails. The cluster's apiserver runs on the standard port. Inspect and fix the file.",
    hint: {
      url: 'https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/',
      path: 'Concepts → Configuration → Organize Cluster Access using kubeconfig',
      tip: 'Test with: kubectl --kubeconfig=/root/CKA/admin.kubeconfig get nodes. Common issue: the server: URL has the wrong port (e.g. 1234 instead of 6443). Fix in clusters[].cluster.server.'
    },
    answer: {
      explanation: 'kubeadm clusters always use port <strong>6443</strong> for the apiserver. If the kubeconfig shows anything else (1234, 8080, etc.), correct it.',
      yaml: `# Test the failing kubeconfig
kubectl --kubeconfig=/root/CKA/admin.kubeconfig get nodes

# Inspect it
cat /root/CKA/admin.kubeconfig

# Fix the server URL
vi /root/CKA/admin.kubeconfig
# Change:
#   clusters:
#   - cluster:
#       certificate-authority-data: ...
#       server: https://controlplane:1234     <-- WRONG
# To:
#       server: https://controlplane:6443     <-- 6443 is the apiserver port

# Verify
kubectl --kubeconfig=/root/CKA/admin.kubeconfig get nodes`
    }
  },
  {
    id: 'cka-ts-2',
    topic: 'cka-troubleshoot',
    difficulty: 'hard',
    title: 'kubectl not working at all, diagnose the control plane',
    scenario: 'On <code>cluster2-controlplane</code>, kubectl commands fail (connection refused / timeout). Bring kubectl back to a working state.',
    hint: {
      url: 'https://kubernetes.io/docs/tasks/debug/debug-cluster/',
      path: 'Tasks → Debug → Troubleshooting Clusters',
      tip: 'Walk the stack: (1) is kubelet running? systemctl status kubelet → journalctl -u kubelet -f. (2) is the apiserver static pod healthy? crictl ps + crictl logs. (3) check /etc/kubernetes/manifests/kube-apiserver.yaml for typos in --etcd-servers / --service-cluster-ip-range / cert paths. (4) /etc/kubernetes/admin.conf permissions and KUBECONFIG.'
    },
    answer: {
      explanation: 'Most cluster2 troubleshooting tasks come down to: a typo in <code>/etc/kubernetes/manifests/kube-apiserver.yaml</code>, a stopped kubelet, or a bad <code>KUBECONFIG</code>. Walk the stack from kubelet → static pods → manifest.',
      yaml: `# 1. Is the kubelet running?
systemctl status kubelet
# If not: systemctl start kubelet
journalctl -u kubelet -n 50 --no-pager

# 2. Are the static control plane pods running?
sudo crictl ps -a | grep -E 'apiserver|controller|scheduler|etcd'
# If apiserver is missing/crashing:
sudo crictl logs <container-id>

# 3. Inspect the apiserver manifest for typos
cat /etc/kubernetes/manifests/kube-apiserver.yaml | grep -E '(etcd|cert|key|client-ca|tls)'
# Common breakage: wrong --etcd-servers URL, wrong cert path,
# accidentally renamed file in /etc/kubernetes/pki/

# 4. KUBECONFIG sanity
echo $KUBECONFIG
ls -l /etc/kubernetes/admin.conf
# If empty:
export KUBECONFIG=/etc/kubernetes/admin.conf
# Or for kubeadm default:
mkdir -p $HOME/.kube
sudo cp /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# 5. Final test
kubectl get nodes`
    }
  },
  {
    id: 'cka-ts-3',
    topic: 'cka-troubleshoot',
    difficulty: 'hard',
    title: 'Deployment pods stuck pending due to ResourceQuota, fix without changing limits or quota',
    scenario: "Deployment <code>backend-api</code> shows 2/3 ready. The third pod fails to schedule. There is a <code>ResourceQuota</code> <code>cpu-mem-quota</code> in the default namespace. <strong>You may NOT edit the deployment's resource limits or the ResourceQuota.</strong> Make all 3 pods Running.",
    hint: {
      url: 'https://kubernetes.io/docs/concepts/policy/resource-quotas/',
      path: 'Concepts → Policies → Resource Quotas',
      tip: `Wording trap: "limits" must not change, but the deployment's resource REQUESTS can be reduced (limits ≠ requests). kubectl describe rs to see the exact "exceeded quota" error. Lower spec.template.spec.containers[].resources.requests, then delete the old ReplicaSet to force the new pod template to take effect.`
    },
    answer: {
      explanation: '<span class="highlight">Wording trap:</span> "limits" in the prompt means the limits field; you can still adjust <code>requests</code>. Reducing <code>requests.memory</code>/<code>cpu</code> fits the deployment under the quota, with limits untouched.',
      yaml: `# 1. See the deployment status
kubectl get deploy backend-api
# Output: backend-api 2/3 ...

# 2. Find the failing ReplicaSet event
kubectl get rs
kubectl describe rs backend-api-7977bfdbd5
# Look for: "exceeded quota: cpu-mem-quota,
#            requested: requests.memory=128Mi, used: 256Mi, limited: 300Mi"

# 3. Edit the deployment, reduce REQUESTS only (limits unchanged)
kubectl edit deployment backend-api
# spec.template.spec.containers[].resources:
#   requests:
#     cpu: "50m"           <-- was 100m
#     memory: "90Mi"       <-- was 128Mi (now 3 x 90 = 270Mi, fits in 300Mi)
#   limits:
#     cpu: "150m"          <-- UNCHANGED
#     memory: "150Mi"      <-- UNCHANGED

# 4. Old RS may still exist, delete it to clear stuck pods
kubectl get rs
kubectl delete rs backend-api-7977bfdbd5

# 5. Verify
kubectl get pods                    # 3/3 Running
kubectl describe deploy backend-api | grep Limits   # limits unchanged
kubectl describe quota cpu-mem-quota                # quota unchanged`
    }
  },
  {
    id: 'cka-ts-4',
    topic: 'cka-troubleshoot',
    difficulty: 'medium',
    title: 'PVC stuck Pending, fix size/selector mismatch without altering the PV',
    scenario: "A deployment <code>alpha-mysql</code> in namespace <code>alpha</code> has pods stuck in Pending. There's a PV <code>alpha-pv</code> already created. The pods should mount it at <code>/var/lib/mysql</code> with env <code>MYSQL_ALLOW_EMPTY_PASSWORD=1</code>. <strong>Do NOT alter the PV.</strong>",
    hint: {
      url: 'https://kubernetes.io/docs/concepts/storage/persistent-volumes/#binding',
      path: 'Concepts → Storage → Persistent Volumes → Binding',
      tip: "PVCs bind to PVs only when storage size, accessModes, and (if present) selector labels all match. kubectl describe pvc shows the binding error. Fix the PVC (or the deployment's PVC ref / volume mount); never touch the PV."
    },
    answer: {
      explanation: 'Binding requires: PVC.requests.storage ≤ PV.capacity, accessModes overlap, and PVC.selector matches PV.labels (when set). Adjust the PVC, not the PV.',
      yaml: `# 1. See what the PV exposes
kubectl get pv alpha-pv -o yaml
# Note: capacity, accessModes, labels (if any), storageClassName

# 2. See why the PVC isn't binding
kubectl describe pvc -n alpha
# "no PV available" usually means storage size or selector mismatch

# 3. Edit the PVC to match the PV
kubectl edit pvc <pvc-name> -n alpha
# Common fixes:
#   spec.resources.requests.storage: <= PV capacity (e.g. 500Mi instead of 1Gi)
#   spec.accessModes: overlap with PV (e.g. ReadWriteOnce)
#   spec.selector.matchLabels: match PV's labels exactly
#   spec.storageClassName: must match (often "" / manual / standard)

# 4. Make sure the deployment has the env + volume mount
kubectl edit deploy alpha-mysql -n alpha
# spec.template.spec.containers[].env:
# - name: MYSQL_ALLOW_EMPTY_PASSWORD
#   value: "1"
# spec.template.spec.containers[].volumeMounts:
# - name: data
#   mountPath: /var/lib/mysql

# 5. Verify
kubectl get pvc -n alpha            # Bound
kubectl get pods -n alpha           # Running`
    }
  }
];
