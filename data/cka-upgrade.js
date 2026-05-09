// Questions for topic 'cka-upgrade'. Loaded by index.html before js/questions.js,
// which concatenates all Q_* arrays into the global QUESTIONS.

const Q_CKA_UPGRADE = [
  {
    id: 'cka-up-1',
    topic: 'cka-upgrade',
    difficulty: 'hard',
    title: 'Upgrade controlplane from v1.34 to v1.35 with kubeadm',
    scenario: 'Upgrade the controlplane node from <code>v1.34.0</code> to <code>v1.35.0</code> using kubeadm. Drain the controlplane first. After upgrade, uncordon. Do not touch worker nodes yet.',
    hint: {
      url: 'https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/',
      path: 'Tasks → Administer a Cluster → kubeadm → Upgrading kubeadm clusters',
      tip: 'Use the version-pinned doc URL: v1-35.docs.kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/. The apt sources line MUST match your target minor (pkgs.k8s.io/core:/stable:/v1.35/deb/). Sequence: drain → unhold → install kubeadm → upgrade plan → upgrade apply → install kubelet+kubectl → daemon-reload → restart kubelet → uncordon.'
    },
    answer: {
      explanation: `Two steps that fail silently if skipped: (1) update <code>/etc/apt/sources.list.d/kubernetes.list</code> to the target minor before <code>apt update</code>. (2) <code>apt-mark unhold</code> kubeadm/kubelet/kubectl, install, then <code>apt-mark hold</code>.`,
      yaml: `# 1. Drain the controlplane
kubectl drain controlplane --ignore-daemonsets

# 2. Update the apt repo to the target minor
# Edit /etc/apt/sources.list.d/kubernetes.list, change v1.34 to v1.35:
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.35/deb/ /' \\
  | sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt update
sudo apt-cache madison kubeadm   # confirm 1.35.0-1.1 is available

# 3. Upgrade kubeadm itself
sudo apt-mark unhold kubeadm
sudo apt-get install -y kubeadm='1.35.0-1.1'
sudo apt-mark hold kubeadm
kubeadm version

# 4. Plan + apply (only on FIRST controlplane)
sudo kubeadm upgrade plan
sudo kubeadm upgrade apply v1.35.0

# 5. Upgrade kubelet + kubectl
sudo apt-mark unhold kubelet kubectl
sudo apt-get install -y kubelet='1.35.0-1.1' kubectl='1.35.0-1.1'
sudo apt-mark hold kubelet kubectl

# 6. Restart kubelet
sudo systemctl daemon-reload
sudo systemctl restart kubelet

# 7. Uncordon
kubectl uncordon controlplane
kubectl get nodes   # controlplane should show v1.35.0 Ready`
    }
  },
  {
    id: 'cka-up-2',
    topic: 'cka-upgrade',
    difficulty: 'medium',
    title: 'Upgrade a worker node and reschedule a deployment to controlplane during downtime',
    scenario: 'Worker <code>node01</code> needs to be upgraded to v1.35.0. Before draining, reschedule the <code>gold-nginx</code> deployment so it ends up on the controlplane (which has been freshly upgraded and uncordoned). Use a node selector or affinity to pin it. Then drain node01 and upgrade.',
    hint: {
      url: 'https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/#upgrade-worker-nodes',
      path: 'Tasks → Administer a Cluster → kubeadm → Upgrade worker nodes',
      tip: 'On worker nodes the command is "kubeadm upgrade node" (NOT "upgrade apply"). Before draining: edit the deployment to add a nodeSelector pointing to controlplane (label kubernetes.io/hostname=controlplane). Pods will reschedule, then drain is safe.'
    },
    answer: {
      explanation: "Worker upgrade uses <code>kubeadm upgrade node</code> (no plan/apply). Pin the deployment to controlplane with a nodeSelector before draining so it doesn't go pending.",
      yaml: `# 1. Pin gold-nginx to controlplane BEFORE draining node01
kubectl edit deploy gold-nginx
# Under spec.template.spec, add:
#   nodeSelector:
#     kubernetes.io/hostname: controlplane
# (or use --overrides / kubectl patch)

# Verify pods reschedule:
kubectl get pods -o wide

# 2. Drain node01
kubectl drain node01 --ignore-daemonsets

# 3. SSH to node01 and upgrade kubeadm
ssh node01
sudo apt-mark unhold kubeadm
sudo apt-get install -y kubeadm='1.35.0-1.1'
sudo apt-mark hold kubeadm

# 4. Worker uses "upgrade node" (NOT plan/apply)
sudo kubeadm upgrade node

# 5. Upgrade kubelet + kubectl
sudo apt-mark unhold kubelet kubectl
sudo apt-get install -y kubelet='1.35.0-1.1' kubectl='1.35.0-1.1'
sudo apt-mark hold kubelet kubectl
sudo systemctl daemon-reload
sudo systemctl restart kubelet
exit

# 6. Uncordon node01
kubectl uncordon node01
kubectl get nodes`
    }
  }
];
