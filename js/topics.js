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
    ]
  },
];

const FOCUS_ORDER = ['cka-etcd', 'cka-crictl', 'cka-gateway', 'ingress', 'cka-cni', 'cka-helm', 'cka-troubleshoot', 'cka-upgrade'];
const focusTopics = () => FOCUS_ORDER.map(id => TOPICS.find(t => t.id === id)).filter(Boolean);
