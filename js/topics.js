// Topics: ordering and metadata. Add focus: true and append the id to FOCUS_ORDER
// to surface a topic in the home hero.

const TOPICS = [
  {
    id: 'network-policy',
    label: 'Network Policies',
    icon: 'shield-check',
    docsUrl: 'https://kubernetes.io/docs/concepts/services-networking/network-policies/',
    docsPath: 'Concepts → Services, LB & Networking → Network Policies',
    searchTip: 'Search "network policy", look for the podSelector + ingress/egress spec example',
    subtitle: 'Add allow rules without disturbing default-deny.',
    docLinks: [
      { label: 'NetworkPolicy concept', url: 'https://kubernetes.io/docs/concepts/services-networking/network-policies/', tip: 'Search: networkpolicy podSelector' },
      { label: 'Declare policy', url: 'https://kubernetes.io/docs/tasks/administer-cluster/declare-network-policy/', tip: 'Search: declare network policy' },
    ]
  },
  {
    id: 'ingress',
    focus: true,
    label: 'Ingress',
    icon: 'globe',
    docsUrl: 'https://kubernetes.io/docs/concepts/services-networking/ingress/',
    docsPath: 'Concepts → Services, LB & Networking → Ingress',
    searchTip: 'Search "ingress", the spec.rules[].http.paths[].backend.service.port section',
    subtitle: 'backend.service.port is the workload Service port, not the IngressController NodePort.',
    docLinks: [
      { label: 'Ingress concept', url: 'https://kubernetes.io/docs/concepts/services-networking/ingress/', tip: 'Find: spec.rules, backend.service.port' },
      { label: 'IngressClass', url: 'https://kubernetes.io/docs/concepts/services-networking/ingress/#ingress-class', tip: 'Search: ingressClassName' },
      { label: 'kubectl create ingress', url: 'https://kubernetes.io/docs/reference/kubectl/generated/kubectl_create/kubectl_create_ingress/', tip: 'Imperative create command' },
    ],
    lockIn: [
      {
        title: 'backend.service.port.number is the WORKLOAD Service port',
        note: 'Not the IngressController NodePort. If the IngressController is on NodePort 30093 and your app Service is on 8080, the Ingress backend goes to 8080. Mixing these up failed an exam question.',
        cmd: `# In the Ingress:
backend:
  service:
    name: video-service
    port:
      number: 8080         # workload Service ClusterIP port
      # NOT the 30093 NodePort on the IngressController`
      },
      {
        title: 'ingressClassName goes under spec, not annotations',
        note: 'The old kubernetes.io/ingress.class annotation still works in some controllers but is deprecated. spec.ingressClassName is the v1 way.',
        cmd: `spec:
  ingressClassName: nginx   # NOT annotations
  rules: [...]`
      },
      {
        title: 'Imperative kubectl create ingress beats writing YAML',
        note: 'Single-rule Ingress with annotations and class can be one command. Faster than scaffolding YAML.',
        cmd: `kubectl create ingress ingress-resource-xnz \\
  --namespace global-space \\
  --rule='/eat=food-service:8080' \\
  --annotation='nginx.ingress.kubernetes.io/rewrite-target=/' \\
  --annotation='nginx.ingress.kubernetes.io/ssl-redirect=false' \\
  --class=nginx`
      },
      {
        title: 'Multi-host: each rules[].host has its own paths',
        note: 'Don\'t try to nest hosts under a single rules entry. Each hostname is a separate top-level rules item.',
        cmd: `spec:
  rules:
  - host: watch.ecom-store.com
    http:
      paths:
      - path: /video
        pathType: Prefix
        backend: { service: { name: video-service, port: { number: 8080 } } }
  - host: apparels.ecom-store.com
    http:
      paths:
      - path: /wear
        pathType: Prefix
        backend: { service: { name: apparels-service, port: { number: 8080 } } }`
      },
      {
        title: 'IngressController args live on the Deployment, not the Ingress',
        note: 'Errors like "default-backend-service not found" come from the controller\'s --default-backend-service arg. Edit the controller Deployment YAML, not the Ingress resource.',
        cmd: `kubectl get -n ingress-nginx deploy ingress-nginx-controller -o yaml > ing-ctrl.yaml
# Edit args:
#   - --default-backend-service=green-space/default-backend-service
kubectl apply -f ing-ctrl.yaml`
      }
    ],
    kodekloud: [
      { lab: 'Ingress Networking - 1', module: 'Services & Networking' },
      { lab: 'Ingress Networking - 2', module: 'Services & Networking' }
    ]
  },
  {
    id: 'cronjob',
    label: 'CronJobs & Jobs',
    icon: 'clock-countdown',
    docsUrl: 'https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/',
    docsPath: 'Concepts → Workloads → Workload Management → CronJob',
    searchTip: 'Search "cronjob", find jobTemplate.spec section for activeDeadlineSeconds',
    subtitle: 'activeDeadlineSeconds and backoffLimit live under jobTemplate.spec, not the top-level CronJob spec.',
    docLinks: [
      { label: 'CronJob', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/', tip: 'Look for jobTemplate.spec' },
      { label: 'Job', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/job/', tip: 'backoffLimit, activeDeadlineSeconds' },
      { label: 'kubectl create cronjob', url: 'https://kubernetes.io/docs/reference/kubectl/generated/kubectl_create/kubectl_create_cronjob/', tip: 'Imperative command' },
    ]
  },
  {
    id: 'observability',
    label: 'Observability',
    icon: 'eye',
    docsUrl: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/',
    docsPath: 'Tasks → Configure Pods → Configure Liveness, Readiness, Startup Probes',
    searchTip: 'Search "liveness probe", note the 3 types: exec, httpGet, tcpSocket',
    subtitle: 'Probe types (exec/httpGet/tcpSocket), kubectl top, log redirection.',
    docLinks: [
      { label: 'Liveness/Readiness probes', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/', tip: 'All 3 probe types here' },
      { label: 'kubectl logs', url: 'https://kubernetes.io/docs/reference/kubectl/generated/kubectl_logs/', tip: 'Search: kubectl logs' },
      { label: 'kubectl top', url: 'https://kubernetes.io/docs/reference/kubectl/generated/kubectl_top/', tip: 'kubectl top pods --sort-by' },
      { label: 'Debug pods', url: 'https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/', tip: 'Events and describe patterns' },
    ]
  },
  {
    id: 'design-build',
    label: 'App Design & Build',
    icon: 'blueprint',
    docsUrl: 'https://kubernetes.io/docs/concepts/workloads/pods/init-containers/',
    docsPath: 'Concepts → Workloads → Pods → Init Containers',
    searchTip: 'Search "sidecar" or "init container", look at spec.initContainers',
    subtitle: 'Multi-container patterns, init containers, sidecars, CRDs, Security Contexts.',
    docLinks: [
      { label: 'Init containers', url: 'https://kubernetes.io/docs/concepts/workloads/pods/init-containers/', tip: 'spec.initContainers' },
      { label: 'Sidecar containers', url: 'https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/', tip: 'restartPolicy: Always in initContainers' },
      { label: 'ConfigMaps', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/', tip: 'envFrom, env.valueFrom' },
      { label: 'Secrets', url: 'https://kubernetes.io/docs/concepts/configuration/secret/', tip: 'secretKeyRef, volume mount' },
      { label: 'Security Context', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/security-context/', tip: 'capabilities, runAsUser' },
      { label: 'CRDs', url: 'https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/', tip: 'openAPIV3Schema, subresources' },
    ]
  },
  {
    id: 'services',
    label: 'Services & Networking',
    icon: 'plugs-connected',
    docsUrl: 'https://kubernetes.io/docs/concepts/services-networking/service/',
    docsPath: 'Concepts → Services, LB & Networking → Service',
    searchTip: 'Search "service", find spec.selector and spec.ports. For ClusterIP: kubectl create service clusterip.',
    subtitle: 'ClusterIP creation with label selectors, pod IP listing with custom-columns.',
    docLinks: [
      { label: 'Service concept', url: 'https://kubernetes.io/docs/concepts/services-networking/service/', tip: 'spec.selector, spec.ports, ClusterIP type' },
      { label: 'kubectl create service clusterip', url: 'https://kubernetes.io/docs/reference/kubectl/generated/kubectl_create/kubectl_create_service_clusterip/', tip: 'kubectl create service clusterip NAME --tcp=port:targetPort' },
      { label: 'kubectl get custom-columns', url: 'https://kubernetes.io/docs/reference/kubectl/generated/kubectl_get/', tip: '-o custom-columns=\'COL:.jsonpath\' --sort-by=.field' },
    ]
  },
  {
    id: 'deployment',
    label: 'App Deployment',
    icon: 'rocket-launch',
    docsUrl: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/',
    docsPath: 'Concepts → Workloads → Workload Management → Deployments',
    searchTip: 'Search "rollingupdate", spec.strategy.rollingUpdate.maxSurge/maxUnavailable.',
    subtitle: 'RollingUpdate, blue/green, Helm, kubectl rollout.',
    docLinks: [
      { label: 'Deployment', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/', tip: 'rollingUpdate strategy, rollback' },
      { label: 'kubectl rollout', url: 'https://kubernetes.io/docs/reference/kubectl/generated/kubectl_rollout/', tip: 'undo, history, status' },
      { label: 'Helm quickstart', url: 'https://helm.sh/docs/intro/quickstart/', tip: 'helm install, lint, ls' },
      { label: 'RBAC', url: 'https://kubernetes.io/docs/reference/access-authn-authz/rbac/', tip: 'Role, ClusterRole, non-resource URLs' },
    ]
  },

  // ────────────────────── CKA TOPICS ──────────────────────
  {
    id: 'cka-etcd',
    cert: 'cka',
    focus: true,
    label: 'etcd Backup & Restore',
    icon: 'database',
    docsUrl: 'https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/',
    docsPath: 'Tasks → Administer a Cluster → Operating etcd',
    searchTip: 'Search "backup etcd", find the snapshot save command (the one with --cacert/--cert/--key)',
    subtitle: 'etcdctl snapshot save/restore with the three TLS flags. Cert paths come from the etcd static pod manifest.',
    docLinks: [
      { label: 'Backup an etcd cluster', url: 'https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/#backing-up-an-etcd-cluster', tip: 'Search: backup etcd cluster' },
      { label: 'Restore an etcd cluster', url: 'https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/#restoring-an-etcd-cluster', tip: 'Search: restore etcd snapshot' },
      { label: 'etcdctl snapshot', url: 'https://etcd.io/docs/v3.5/op-guide/recovery/', tip: 'snapshot save / status / restore' },
    ],
    lockIn: [
      {
        title: 'Always set ETCDCTL_API=3 first',
        note: 'Without it, etcdctl falls back to v2 syntax and the snapshot subcommand doesn\'t exist. Easy to forget under exam pressure.',
        cmd: 'export ETCDCTL_API=3'
      },
      {
        title: 'All three TLS flags are mandatory; missing one hangs silently',
        note: '--cacert, --cert, --key. No timeout, no error. The command just sits there.',
        cmd: `etcdctl snapshot save /opt/etcd-backup.db \\
  --endpoints=127.0.0.1:2379 \\
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\
  --cert=/etc/kubernetes/pki/etcd/server.crt \\
  --key=/etc/kubernetes/pki/etcd/server.key`
      },
      {
        title: 'Don\'t assume cert paths; grep them from the etcd manifest',
        note: 'Different installs (kubeadm vs kubespray vs others) put certs in different places. The etcd static pod manifest has the canonical paths in its --cert-file / --key-file / --trusted-ca-file flags.',
        cmd: `grep -E '(data-dir|cert-file|key-file|trusted-ca-file|listen-client-urls)' \\
  /etc/kubernetes/manifests/etcd.yaml`
      },
      {
        title: 'Restore = TWO edits in etcd.yaml: --data-dir AND volumes.hostPath.path',
        note: 'Miss the volume mount path and etcd reads the wrong directory. Both must point at the new restored data dir.',
        cmd: `# After: etcdctl snapshot restore /opt/snapshot.db --data-dir=/var/lib/etcd-from-backup
# Edit /etc/kubernetes/manifests/etcd.yaml, change BOTH:
#   spec.containers[0].command: --data-dir=/var/lib/etcd-from-backup
#   spec.volumes[].hostPath.path: /var/lib/etcd-from-backup
# Kubelet auto-restarts the pod when the manifest changes (~30s).`
      },
      {
        title: 'Verify the snapshot before walking away',
        note: 'snapshot status reads the file; if it errors, you didn\'t actually back up.',
        cmd: 'etcdctl --write-out=table snapshot status /opt/etcd-backup.db'
      }
    ],
    kodekloud: [
      { lab: 'Backup and Restore Methods', module: 'Cluster Maintenance' },
      { lab: 'Backup and Restore Methods - 2', module: 'Cluster Maintenance' }
    ]
  },
  {
    id: 'cka-crictl',
    cert: 'cka',
    focus: true,
    label: 'crictl & Container Runtime',
    icon: 'terminal-window',
    docsUrl: 'https://kubernetes.io/docs/tasks/debug/debug-cluster/crictl/',
    docsPath: 'Tasks → Monitoring, Logging, Debugging → Debugging Kubernetes nodes with crictl',
    searchTip: 'Search "crictl", find the crictl ps / logs / inspect commands. crictl is the runtime-side equivalent of kubectl/docker for control-plane and node debugging.',
    subtitle: 'crictl ps / logs / inspect for node-level debugging when kubelet or static pods are broken.',
    docLinks: [
      { label: 'Debugging nodes with crictl', url: 'https://kubernetes.io/docs/tasks/debug/debug-cluster/crictl/', tip: 'crictl ps, crictl logs, crictl inspect' },
      { label: 'crictl on GitHub', url: 'https://github.com/kubernetes-sigs/cri-tools/blob/master/docs/crictl.md', tip: 'Full command reference, including --runtime-endpoint' },
      { label: 'Troubleshoot Clusters', url: 'https://kubernetes.io/docs/tasks/debug/debug-cluster/', tip: 'When kubectl is gone, you fall back to crictl + journalctl' },
    ],
    lockIn: [
      {
        title: 'When kubectl is broken, walk: kubelet → crictl → manifest',
        note: 'apiserver/etcd/scheduler/controller-manager all run as containers under containerd. crictl talks to the runtime directly, no apiserver required.',
        cmd: `# Is kubelet running?
systemctl status kubelet
journalctl -u kubelet -n 50 --no-pager

# What containers does the runtime see?
sudo crictl ps -a | grep -E 'apiserver|etcd|scheduler|controller'

# Why is one crashing?
sudo crictl logs <container-id>`
      },
      {
        title: 'crictl ps vs crictl pods',
        note: 'ps lists containers; pods lists pod sandboxes. Two different views of the same world. Use ps when you want logs, pods when you want to know what\'s scheduled.',
        cmd: `crictl ps -a            # all containers (running + exited)
crictl pods             # pod sandboxes
crictl inspect <id>     # full json for one container`
      },
      {
        title: 'Default endpoint warning is noise; suppress it once',
        note: 'crictl complains about no runtime-endpoint set on every command. Drop a config file once.',
        cmd: `cat <<EOF | sudo tee /etc/crictl.yaml
runtime-endpoint: unix:///run/containerd/containerd.sock
image-endpoint: unix:///run/containerd/containerd.sock
timeout: 10
EOF`
      },
      {
        title: 'Pair with journalctl for the kubelet-side story',
        note: 'crictl shows what the runtime did; journalctl -u kubelet shows what asked for it. Both are needed for static-pod / image-pull failures.',
        cmd: `journalctl -u kubelet -f                # follow live
journalctl -u kubelet --since '5 min ago'`
      }
    ],
    kodekloud: [
      { lab: 'Troubleshooting - Control Plane Failure', module: 'Troubleshooting' },
      { lab: 'Troubleshooting - Worker Node Failure', module: 'Troubleshooting' }
    ]
  },
  {
    id: 'cka-jsonpath',
    cert: 'cka',
    label: 'JSONPath & Custom Columns',
    icon: 'magnifying-glass',
    docsUrl: 'https://kubernetes.io/docs/reference/kubectl/jsonpath/',
    docsPath: 'Reference → kubectl → JSONPath Support',
    searchTip: 'Search "jsonpath", try the cheat sheet too. custom-columns lives in kubectl_get reference.',
    subtitle: 'JSONPath ranges/filters and -o custom-columns with --sort-by.',
    docLinks: [
      { label: 'JSONPath Support', url: 'https://kubernetes.io/docs/reference/kubectl/jsonpath/', tip: 'Range, index, filter, escape syntax' },
      { label: 'kubectl Cheat Sheet', url: 'https://kubernetes.io/docs/reference/kubectl/quick-reference/', tip: 'Search: custom-columns, has copy-paste examples' },
      { label: 'kubectl get reference', url: 'https://kubernetes.io/docs/reference/kubectl/generated/kubectl_get/', tip: '-o custom-columns / --sort-by' },
    ]
  },
  {
    id: 'cka-upgrade',
    cert: 'cka',
    focus: true,
    label: 'kubeadm Cluster Upgrades',
    icon: 'arrow-fat-line-up',
    docsUrl: 'https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/',
    docsPath: 'Tasks → Administer a Cluster → kubeadm → Upgrading kubeadm clusters',
    searchTip: 'Search "kubeadm upgrade", the docs site for the EXACT minor version (v1-X) has the apt sources URL you need.',
    subtitle: 'apt repo bump, drain, unhold, upgrade plan/apply, kubelet restart, uncordon.',
    docLinks: [
      { label: 'Upgrade kubeadm clusters', url: 'https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/', tip: 'Use the version-pinned URL: v1-XX.docs.kubernetes.io' },
      { label: 'Safely Drain a Node', url: 'https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/', tip: 'kubectl drain --ignore-daemonsets' },
      { label: 'kubectl drain', url: 'https://kubernetes.io/docs/reference/kubectl/generated/kubectl_drain/', tip: '--ignore-daemonsets, --delete-emptydir-data' },
    ],
    lockIn: [
      {
        title: 'Bump the apt repo to the target minor BEFORE apt update',
        note: 'The /etc/apt/sources.list.d/kubernetes.list line pins to a minor version (v1.34, v1.35). If you forget to change it, apt-cache madison kubeadm shows the OLD minor\'s versions and the upgrade picks a patch instead.',
        cmd: `# Going from 1.34 -> 1.35:
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.35/deb/ /' \\
  | sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt update
sudo apt-cache madison kubeadm   # confirm 1.35.x-1.1 is listed`
      },
      {
        title: 'apt-mark unhold, install, apt-mark hold (every package)',
        note: 'kubeadm, kubelet, kubectl are all held by default after kubeadm bootstrap. Forgetting unhold makes apt skip the upgrade silently. Forgetting hold after means the next unattended-upgrades run can yank you off-version.',
        cmd: `sudo apt-mark unhold kubeadm
sudo apt-get install -y kubeadm='1.35.0-1.1'
sudo apt-mark hold kubeadm

# Repeat for kubelet + kubectl after kubeadm upgrade apply`
      },
      {
        title: 'Controlplane: plan + apply. Workers: node only.',
        note: 'kubeadm upgrade plan + kubeadm upgrade apply v1.35.0 ONLY on the first controlplane. Worker nodes (and additional controlplanes) use kubeadm upgrade node, no plan/apply.',
        cmd: `# First controlplane:
sudo kubeadm upgrade plan
sudo kubeadm upgrade apply v1.35.0

# Worker nodes (and second/third controlplanes):
sudo kubeadm upgrade node`
      },
      {
        title: 'After kubelet install: daemon-reload, restart, uncordon',
        note: 'systemd doesn\'t auto-pick-up the new kubelet binary. Forgetting daemon-reload + restart leaves the node running the old kubelet against new kubeadm config.',
        cmd: `sudo systemctl daemon-reload
sudo systemctl restart kubelet
kubectl uncordon <node>
kubectl get nodes   # should show new version, Ready`
      },
      {
        title: 'Drain BEFORE upgrade; pin critical workloads if a worker hosts them',
        note: 'kubectl drain --ignore-daemonsets. If you\'re upgrading the only worker that runs gold-nginx, edit the deployment\'s nodeSelector to pin it to controlplane first so it doesn\'t go Pending during drain.',
        cmd: `# Pin a deployment to the controlplane before draining its current worker:
kubectl edit deploy gold-nginx
# spec.template.spec.nodeSelector:
#   kubernetes.io/hostname: controlplane

kubectl drain node01 --ignore-daemonsets`
      }
    ],
    kodekloud: [
      { lab: 'Cluster Upgrade Process', module: 'Cluster Maintenance' },
      { lab: 'Drain, Cordon and Uncordon', module: 'Cluster Maintenance' }
    ]
  },
  {
    id: 'cka-static-pod',
    cert: 'cka',
    label: 'Static Pods',
    icon: 'push-pin',
    docsUrl: 'https://kubernetes.io/docs/tasks/configure-pod-container/static-pod/',
    docsPath: 'Tasks → Configure Pods and Containers → Create static Pods',
    searchTip: 'Search "static pod", find the staticPodPath kubelet config and /etc/kubernetes/manifests pattern.',
    subtitle: 'Drop a pod manifest in the kubelet staticPodPath, kubelet picks it up automatically.',
    docLinks: [
      { label: 'Create Static Pods', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/static-pod/', tip: 'staticPodPath in kubelet config' },
      { label: 'kubelet config reference', url: 'https://kubernetes.io/docs/reference/config-api/kubelet-config.v1beta1/', tip: '/var/lib/kubelet/config.yaml' },
    ]
  },
  {
    id: 'cka-csr-rbac',
    cert: 'cka',
    label: 'CSR & RBAC Users',
    icon: 'key',
    docsUrl: 'https://kubernetes.io/docs/reference/access-authn-authz/certificate-signing-requests/',
    docsPath: 'Reference → Access, Authn, Authz → Certificate Signing Requests',
    searchTip: 'Search "certificate signing request", find the YAML with signerName + base64 request + usages.',
    subtitle: 'Create CertificateSigningRequest, approve, bind a Role to the new user.',
    docLinks: [
      { label: 'CertificateSigningRequest', url: 'https://kubernetes.io/docs/reference/access-authn-authz/certificate-signing-requests/', tip: 'signerName: kubernetes.io/kube-apiserver-client' },
      { label: 'Normal user CSR walkthrough', url: 'https://kubernetes.io/docs/tasks/tls/managing-tls-in-a-cluster/', tip: 'base64 -w 0 the .csr file for the request field' },
      { label: 'RBAC Authorization', url: 'https://kubernetes.io/docs/reference/access-authn-authz/rbac/', tip: 'kubectl create role / rolebinding' },
    ]
  },
  {
    id: 'cka-dns',
    cert: 'cka',
    label: 'DNS & Service Discovery',
    icon: 'address-book',
    docsUrl: 'https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/',
    docsPath: 'Concepts → Services, LB & Networking → DNS for Services and Pods',
    searchTip: 'Search "dns for services", find the FQDN format: <svc>.<ns>.svc.cluster.local and the pod-IP form (a-b-c-d.<ns>.pod).',
    subtitle: 'nslookup Services and Pods from inside the cluster using busybox:1.28.',
    docLinks: [
      { label: 'DNS for Services and Pods', url: 'https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/', tip: 'Service FQDN + pod hostname format' },
      { label: 'Debugging DNS Resolution', url: 'https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/', tip: 'busybox:1.28 (newer images break nslookup)' },
    ]
  },
  {
    id: 'cka-cni',
    cert: 'cka',
    focus: true,
    label: 'Calico CNI (Tigera Operator)',
    icon: 'tree-structure',
    docsUrl: 'https://kubernetes.io/docs/concepts/cluster-administration/addons/',
    docsPath: 'Concepts → Cluster Administration → Networking & Network Policy add-ons',
    searchTip: 'Use the projectcalico.org docs (linked from the addons page). Search "Install Calico operator", find tigera-operator.yaml + custom-resources.yaml.',
    subtitle: 'Install Calico via the Tigera operator, customize the IP pool CIDR, verify tigera-operator namespace.',
    docLinks: [
      { label: 'Calico quickstart (operator)', url: 'https://docs.tigera.io/calico/latest/getting-started/kubernetes/quickstart', tip: 'tigera-operator.yaml + custom-resources.yaml' },
      { label: 'K8s networking add-ons', url: 'https://kubernetes.io/docs/concepts/cluster-administration/addons/', tip: 'Calico, Cilium, Flannel links' },
      { label: 'Network plugin requirements', url: 'https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/network-plugins/', tip: 'CNI conf at /etc/cni/net.d' },
    ],
    lockIn: [
      {
        title: 'Use kubectl create -f for tigera-operator.yaml, NOT apply -f',
        note: 'tigera-operator.yaml has a CRD with annotations that exceed apply\'s 262144-byte last-applied-configuration limit. apply silently fails on the operator; create works. This single mistake fails the question.',
        cmd: 'kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.29.2/manifests/tigera-operator.yaml'
      },
      {
        title: 'CIDR override lives in custom-resources.yaml, not the operator',
        note: 'Edit spec.calicoNetwork.ipPools[].cidr before applying. The Installation CR is small enough that apply OR create works on this one.',
        cmd: `# Download, edit, then apply
curl -O https://raw.githubusercontent.com/projectcalico/calico/v3.29.2/manifests/custom-resources.yaml
# Change:
#   ipPools:
#   - cidr: 192.168.0.0/16   <-- default
# To:
#   - cidr: 172.17.0.0/16    <-- your value
kubectl create -f custom-resources.yaml`
      },
      {
        title: 'Verify rollout in calico-system, not kube-system',
        note: 'The operator pattern installs Calico components into the calico-system namespace; tigera-operator runs in tigera-operator. Don\'t check kube-system.',
        cmd: `watch kubectl get pods -n calico-system
kubectl get pods -n tigera-operator`
      }
    ],
    kodekloud: [
      { lab: 'Network Plugins in Kubernetes', module: 'Networking' },
      { lab: 'CNI in Kubernetes', module: 'Networking' }
    ]
  },
  {
    id: 'cka-gateway',
    cert: 'cka',
    focus: true,
    label: 'Gateway API',
    icon: 'door',
    docsUrl: 'https://kubernetes.io/docs/concepts/services-networking/gateway/',
    docsPath: 'Concepts → Services, LB & Networking → Gateway API',
    searchTip: 'Use the gateway-api.sigs.k8s.io docs for full spec. Search "Gateway listeners". For TLS: search "TLS termination".',
    subtitle: 'Gateway with HTTP and HTTPS+TLS listeners; HTTPRoute attaches via parentRefs.',
    docLinks: [
      { label: 'Gateway API concept', url: 'https://kubernetes.io/docs/concepts/services-networking/gateway/', tip: 'Gateway, GatewayClass, HTTPRoute' },
      { label: 'gateway-api.sigs.k8s.io', url: 'https://gateway-api.sigs.k8s.io/', tip: 'Spec reference with copy-paste YAML' },
      { label: 'TLS termination', url: 'https://gateway-api.sigs.k8s.io/guides/tls/', tip: 'listeners[].tls.certificateRefs' },
    ],
    lockIn: [
      {
        title: 'apiVersion is gateway.networking.k8s.io/v1',
        note: 'Not networking.k8s.io. Wrong group = create fails with "no kind Gateway in version".',
        cmd: 'apiVersion: gateway.networking.k8s.io/v1'
      },
      {
        title: 'Each listener needs a unique name field',
        note: 'name is required even when there\'s only one listener. Forgetting it is a common gotcha because most other K8s list items don\'t need names.',
        cmd: `spec:
  gatewayClassName: nginx
  listeners:
  - name: http              # required
    protocol: HTTP
    port: 80`
      },
      {
        title: 'HTTPS termination = HTTPS + 443 + hostname + tls.certificateRefs',
        note: 'tls.mode defaults to Terminate. Cert secret must be in the same namespace as the Gateway, or use a ReferenceGrant.',
        cmd: `listeners:
- name: https
  protocol: HTTPS
  port: 443
  hostname: kodekloud.com
  tls:
    certificateRefs:
    - name: kodekloud-tls   # same-ns secret of type kubernetes.io/tls`
      },
      {
        title: 'Verify with describe; look for ACCEPTED condition',
        note: 'kubectl get gateway shows AGE but not health. describe surfaces the controller\'s ACCEPTED / PROGRAMMED conditions, that\'s the real success signal.',
        cmd: `kubectl get gateway -n nginx-gateway
kubectl describe gateway web-gateway -n nginx-gateway`
      },
      {
        title: 'HTTPRoute attaches via parentRefs',
        note: 'The route doesn\'t live "under" the Gateway in YAML; it\'s separate and points back via parentRefs[]. Different mental model from Ingress.',
        cmd: `apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
spec:
  parentRefs:
  - name: web-gateway
    namespace: nginx-gateway
  rules:
  - backendRefs:
    - name: my-service
      port: 8080`
      }
    ],
    kodekloud: [
      { lab: 'Gateway API', module: 'Networking' }
    ]
  },
  {
    id: 'cka-helm',
    cert: 'cka',
    focus: true,
    label: 'Helm',
    icon: 'package',
    docsUrl: 'https://helm.sh/docs/intro/quickstart/',
    docsPath: 'helm.sh → Docs → Quickstart',
    searchTip: 'helm.sh has the full command reference. helm lint to validate, helm install/upgrade with --version and --set.',
    subtitle: 'helm lint, install, upgrade with --version and --set; repo update before upgrades.',
    docLinks: [
      { label: 'binbashburns/helm-practice', url: 'https://github.com/binbashburns/helm-practice', tip: 'Your own hands-on chart drills, how you originally learned Helm' },
      { label: 'Helm quickstart', url: 'https://helm.sh/docs/intro/quickstart/', tip: 'helm install, lint, ls' },
      { label: 'helm lint', url: 'https://helm.sh/docs/helm/helm_lint/', tip: 'Validate a chart before installing' },
      { label: 'helm upgrade', url: 'https://helm.sh/docs/helm/helm_upgrade/', tip: '--version pins chart version, --set overrides values' },
      { label: 'helm repo', url: 'https://helm.sh/docs/helm/helm_repo/', tip: 'helm repo update before upgrade to see new versions' },
    ],
    lockIn: [
      {
        title: 'helm repo update is mandatory before any version-bumping upgrade',
        note: 'Without it, the local index is stale and helm can\'t see new chart versions in the remote repo. helm install/upgrade --version will fail with "no chart version found".',
        cmd: `helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update`
      },
      {
        title: 'Real install with concrete values (not <chart> placeholders)',
        note: 'Pin the chart version with --version (chart version, NOT app version). Override single values inline with --set; pass a file with -f values.yaml.',
        cmd: `# Install bitnami/nginx 15.4.0 as release "web" in namespace "frontend"
helm install web bitnami/nginx \\
  --version 15.4.0 \\
  --namespace frontend \\
  --create-namespace \\
  --set image.tag=1.25 \\
  --set replicaCount=3`
      },
      {
        title: 'Upgrade to a new chart version with overrides',
        note: 'Same syntax as install. --version pins the chart version. --set overrides win over -f files.',
        cmd: `helm repo update
helm upgrade lvm-crystal-apd lvm-crystal-apd/nginx \\
  --version 18.1.15 \\
  --namespace crystal-apd-ns \\
  --set replicaCount=2

# Verify
helm ls -n crystal-apd-ns
kubectl get pods -n crystal-apd-ns`
      },
      {
        title: 'helm install does NOT create the namespace by default',
        note: 'Without --create-namespace, install fails if the namespace doesn\'t exist. Either pass the flag or kubectl create ns first.',
        cmd: `# Either:
helm install web bitnami/nginx -n frontend --create-namespace

# Or:
kubectl create ns frontend
helm install web bitnami/nginx -n frontend`
      },
      {
        title: 'Lint a chart directory before installing it',
        note: 'helm lint catches template errors (bad apiVersion, missing variables, typo\'d {{ .Values.x }}) before they reach the cluster.',
        cmd: `helm lint ./webapp-color-apd/

# After fixing, re-lint until clean, then install
helm install webapp-color-apd ./webapp-color-apd -n frontend-apd`
      },
      {
        title: 'Common --set traps',
        note: 'Comma-separated values, no spaces. Boolean strings need quotes inside the value. Nested keys use dots.',
        cmd: `helm install web bitnami/nginx \\
  --set 'image.tag=1.25,replicaCount=3,service.type=NodePort' \\
  --set 'ingress.enabled=true'`
      }
    ],
    kodekloud: [
      { lab: 'Helm For Beginners (separate course)', module: 'Helm' }
    ]
  },
  {
    id: 'cka-troubleshoot',
    cert: 'cka',
    focus: true,
    label: 'Cluster Troubleshooting',
    icon: 'wrench',
    docsUrl: 'https://kubernetes.io/docs/tasks/debug/debug-cluster/',
    docsPath: 'Tasks → Monitoring, Logging, and Debugging → Troubleshooting Clusters',
    searchTip: 'Most fixes are config-file edits in /etc/kubernetes/. Check kubelet/etcd/apiserver logs via journalctl + crictl.',
    subtitle: 'kubeconfig fixes, ResourceQuota blocks, broken kubectl, PV/PVC mismatches.',
    docLinks: [
      { label: 'Troubleshoot Clusters', url: 'https://kubernetes.io/docs/tasks/debug/debug-cluster/', tip: 'journalctl -u kubelet, crictl ps' },
      { label: 'Troubleshoot kubeadm', url: 'https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/troubleshooting-kubeadm/', tip: 'kubelet & control plane recovery' },
      { label: 'kubeconfig', url: 'https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/', tip: 'clusters/users/contexts trio' },
      { label: 'Resource Quotas', url: 'https://kubernetes.io/docs/concepts/policy/resource-quotas/', tip: 'requests/limits per quota' },
    ],
    lockIn: [
      {
        title: 'kubeadm apiserver is always on port 6443',
        note: 'If a kubeconfig has 1234, 8080, anything else: it\'s wrong. clusters[].cluster.server should be https://<host>:6443.',
        cmd: `kubectl --kubeconfig=/root/CKA/admin.kubeconfig get nodes
# Failure usually = wrong port. Edit clusters[].cluster.server: https://controlplane:6443`
      },
      {
        title: 'Walk the stack when kubectl is dead',
        note: 'kubelet → static pods (crictl ps) → manifest typos → KUBECONFIG. Don\'t guess; follow the order.',
        cmd: `# 1. kubelet
systemctl status kubelet
journalctl -u kubelet -n 50 --no-pager

# 2. static control plane pods
sudo crictl ps -a | grep -E 'apiserver|etcd|scheduler|controller'
sudo crictl logs <container-id>

# 3. apiserver manifest typos
cat /etc/kubernetes/manifests/kube-apiserver.yaml | grep -E '(etcd|cert|key|client-ca)'

# 4. kubeconfig
echo $KUBECONFIG
ls -l /etc/kubernetes/admin.conf`
      },
      {
        title: 'ResourceQuota wording trap: requests ≠ limits',
        note: 'When the prompt says "do not change limits", you can still change requests. Lowering requests.cpu / requests.memory shrinks the pod\'s quota footprint without touching limits.',
        cmd: `kubectl edit deployment backend-api
# spec.template.spec.containers[].resources:
#   requests:
#     cpu: "50m"           # was 100m
#     memory: "90Mi"       # was 128Mi
#   limits:
#     cpu: "150m"          # UNCHANGED
#     memory: "150Mi"      # UNCHANGED

# Old ReplicaSet may need manual delete to clear stuck pods:
kubectl delete rs backend-api-7977bfdbd5`
      },
      {
        title: 'PVC binding requires FOUR matches; PVC moves, PV does not',
        note: 'storage size, accessModes, selector labels, storageClassName must all align. The exam usually says "do not alter the PV", so the fix is always PVC-side.',
        cmd: `kubectl get pv alpha-pv -o yaml      # capacity, accessModes, labels, storageClassName
kubectl describe pvc -n alpha       # binding error message

kubectl edit pvc <pvc-name> -n alpha
# spec.resources.requests.storage: <= PV.capacity
# spec.accessModes: must overlap with PV
# spec.selector.matchLabels: must match PV.labels exactly
# spec.storageClassName: must match`
      },
      {
        title: 'After editing /etc/kubernetes/manifests/*, kubelet auto-restarts the pod',
        note: 'Don\'t kubectl delete pod, don\'t restart kubelet. Just edit the manifest and wait ~30s. The kubelet\'s file watcher picks up the change.',
        cmd: `# Edit, save, wait
vi /etc/kubernetes/manifests/kube-apiserver.yaml
# (sit for ~30s)
kubectl get pods -n kube-system | grep apiserver`
      }
    ],
    kodekloud: [
      { lab: 'Application Failure', module: 'Troubleshooting' },
      { lab: 'Control Plane Failure', module: 'Troubleshooting' },
      { lab: 'Worker Node Failure', module: 'Troubleshooting' },
      { lab: 'Network Troubleshooting', module: 'Troubleshooting' }
    ]
  },
];

const FOCUS_ORDER = ['cka-etcd', 'cka-crictl', 'cka-gateway', 'ingress', 'cka-cni', 'cka-helm', 'cka-troubleshoot', 'cka-upgrade'];
const focusTopics = () => FOCUS_ORDER.map(id => TOPICS.find(t => t.id === id)).filter(Boolean);
