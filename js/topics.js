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
      { label: 'Ingress concept', url: 'https://kubernetes.io/docs/concepts/services-networking/ingress/', tip: 'spec.rules, backend.service.port' },
      { label: 'IngressClass', url: 'https://kubernetes.io/docs/concepts/services-networking/ingress/#ingress-class', tip: 'spec.ingressClassName' },
      { label: 'kubectl create ingress', url: 'https://kubernetes.io/docs/reference/kubectl/generated/kubectl_create/kubectl_create_ingress/', tip: 'Imperative create' },
    ],
    gotchas: [
      {
        title: 'backend.service.port.number is the workload Service port',
        note: 'Not the IngressController NodePort. App Service on 8080, IngressController on NodePort 30093: backend goes to 8080.',
        cmd: `backend:
  service:
    name: video-service
    port:
      number: 8080         # workload Service port`
      },
      {
        title: 'ingressClassName goes under spec, not annotations',
        cmd: `spec:
  ingressClassName: nginx
  rules: [...]`
      },
      {
        title: 'Imperative kubectl create ingress',
        note: 'Single-rule Ingress with annotations and class in one command.',
        cmd: `kubectl create ingress ingress-resource-xnz \\
  --namespace global-space \\
  --rule='/eat=food-service:8080' \\
  --annotation='nginx.ingress.kubernetes.io/rewrite-target=/' \\
  --annotation='nginx.ingress.kubernetes.io/ssl-redirect=false' \\
  --class=nginx`
      },
      {
        title: 'Multi-host: each rules[].host is its own top-level entry',
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
        title: 'IngressController args live on its Deployment',
        note: '"default-backend-service not found" comes from the controller\'s --default-backend-service flag. Edit the Deployment, not the Ingress.',
        cmd: `kubectl get -n ingress-nginx deploy ingress-nginx-controller -o yaml > ing-ctrl.yaml
# args:
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
      { label: 'CronJob', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/', tip: 'jobTemplate.spec' },
      { label: 'Job', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/job/', tip: 'backoffLimit, activeDeadlineSeconds' },
      { label: 'kubectl create cronjob', url: 'https://kubernetes.io/docs/reference/kubectl/generated/kubectl_create/kubectl_create_cronjob/', tip: 'Imperative create' },
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
      { label: 'Liveness/Readiness probes', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/', tip: 'All 3 probe types' },
      { label: 'kubectl logs', url: 'https://kubernetes.io/docs/reference/kubectl/generated/kubectl_logs/', tip: 'kubectl logs' },
      { label: 'kubectl top', url: 'https://kubernetes.io/docs/reference/kubectl/generated/kubectl_top/', tip: 'kubectl top pods --sort-by' },
      { label: 'Debug pods', url: 'https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/', tip: 'Events and describe' },
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
      { label: 'Service concept', url: 'https://kubernetes.io/docs/concepts/services-networking/service/', tip: 'spec.selector, spec.ports' },
      { label: 'kubectl create service clusterip', url: 'https://kubernetes.io/docs/reference/kubectl/generated/kubectl_create/kubectl_create_service_clusterip/', tip: '--tcp=port:targetPort' },
      { label: 'kubectl get custom-columns', url: 'https://kubernetes.io/docs/reference/kubectl/generated/kubectl_get/', tip: '-o custom-columns / --sort-by' },
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
      { label: 'Backup an etcd cluster', url: 'https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/#backing-up-an-etcd-cluster', tip: 'snapshot save with --cacert/--cert/--key' },
      { label: 'Restore an etcd cluster', url: 'https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/#restoring-an-etcd-cluster', tip: 'snapshot restore --data-dir' },
    ],
    gotchas: [
      {
        title: 'Set ETCDCTL_API=3 first',
        note: 'Without it, etcdctl uses v2 syntax and snapshot does not exist.',
        cmd: 'export ETCDCTL_API=3'
      },
      {
        title: 'All three TLS flags or it hangs',
        note: '--cacert, --cert, --key. Missing one and the command sits with no error.',
        cmd: `etcdctl snapshot save /opt/etcd-backup.db \\
  --endpoints=127.0.0.1:2379 \\
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\
  --cert=/etc/kubernetes/pki/etcd/server.crt \\
  --key=/etc/kubernetes/pki/etcd/server.key`
      },
      {
        title: 'Pull cert paths from the etcd manifest',
        note: 'Paths vary by install. Read them from the live manifest.',
        cmd: `grep -E '(data-dir|cert-file|key-file|trusted-ca-file|listen-client-urls)' \\
  /etc/kubernetes/manifests/etcd.yaml`
      },
      {
        title: 'Restore: edit BOTH --data-dir and volumes.hostPath.path',
        note: 'Miss the volume mount and etcd reads the wrong directory.',
        cmd: `etcdctl snapshot restore /opt/snapshot.db --data-dir=/var/lib/etcd-from-backup

# /etc/kubernetes/manifests/etcd.yaml, change BOTH:
#   spec.containers[0].command: --data-dir=/var/lib/etcd-from-backup
#   spec.volumes[].hostPath.path: /var/lib/etcd-from-backup
# Kubelet auto-restarts the pod (~30s).`
      },
      {
        title: 'Verify the snapshot',
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
    searchTip: 'Search "crictl", find the crictl ps / logs / inspect commands.',
    subtitle: 'crictl ps / logs / inspect for node-level debugging when kubelet or static pods are broken.',
    docLinks: [
      { label: 'Debugging nodes with crictl', url: 'https://kubernetes.io/docs/tasks/debug/debug-cluster/crictl/', tip: 'crictl ps, crictl logs, crictl inspect' },
      { label: 'Troubleshoot Clusters', url: 'https://kubernetes.io/docs/tasks/debug/debug-cluster/', tip: 'crictl + journalctl' },
    ],
    gotchas: [
      {
        title: 'Walk: kubelet → crictl → manifest',
        note: 'crictl talks to the runtime directly.',
        cmd: `systemctl status kubelet
journalctl -u kubelet -n 50 --no-pager

sudo crictl ps -a | grep -E 'apiserver|etcd|scheduler|controller'
sudo crictl logs <container-id>`
      },
      {
        title: 'crictl ps vs crictl pods',
        note: 'ps lists containers; pods lists pod sandboxes.',
        cmd: `crictl ps -a            # all containers (running + exited)
crictl pods             # pod sandboxes
crictl inspect <id>     # full json`
      },
      {
        title: 'Suppress the "no runtime-endpoint" warning once',
        cmd: `cat <<EOF | sudo tee /etc/crictl.yaml
runtime-endpoint: unix:///run/containerd/containerd.sock
image-endpoint: unix:///run/containerd/containerd.sock
timeout: 10
EOF`
      },
      {
        title: 'Pair with journalctl for the kubelet-side story',
        cmd: `journalctl -u kubelet -f
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
      { label: 'kubectl Cheat Sheet', url: 'https://kubernetes.io/docs/reference/kubectl/quick-reference/', tip: 'custom-columns examples' },
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
    searchTip: 'Search "kubeadm upgrade". Use the version-pinned URL: v1-XX.docs.kubernetes.io.',
    subtitle: 'apt repo bump, drain, unhold, upgrade plan/apply, kubelet restart, uncordon.',
    docLinks: [
      { label: 'Upgrade kubeadm clusters', url: 'https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/', tip: 'Use v1-XX.docs.kubernetes.io for the target minor' },
      { label: 'Safely Drain a Node', url: 'https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/', tip: 'kubectl drain --ignore-daemonsets' },
      { label: 'kubectl drain', url: 'https://kubernetes.io/docs/reference/kubectl/generated/kubectl_drain/', tip: '--ignore-daemonsets, --delete-emptydir-data' },
    ],
    gotchas: [
      {
        title: 'Bump the apt repo to the target minor before apt update',
        note: '/etc/apt/sources.list.d/kubernetes.list pins the minor (v1.34, v1.35).',
        cmd: `# 1.34 -> 1.35:
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.35/deb/ /' \\
  | sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt update
sudo apt-cache madison kubeadm`
      },
      {
        title: 'apt-mark unhold, install, apt-mark hold',
        note: 'kubeadm/kubelet/kubectl are held by default. Unhold before install, hold after.',
        cmd: `sudo apt-mark unhold kubeadm
sudo apt-get install -y kubeadm='1.35.0-1.1'
sudo apt-mark hold kubeadm

# Repeat for kubelet + kubectl after kubeadm upgrade apply`
      },
      {
        title: 'Controlplane: plan + apply. Workers: node only.',
        cmd: `# First controlplane:
sudo kubeadm upgrade plan
sudo kubeadm upgrade apply v1.35.0

# Workers (and additional controlplanes):
sudo kubeadm upgrade node`
      },
      {
        title: 'After kubelet install: daemon-reload, restart, uncordon',
        cmd: `sudo systemctl daemon-reload
sudo systemctl restart kubelet
kubectl uncordon <node>`
      },
      {
        title: 'Drain before upgrade; pin critical workloads if a worker hosts them',
        cmd: `kubectl edit deploy gold-nginx
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
      { label: 'Managing TLS in a cluster', url: 'https://kubernetes.io/docs/tasks/tls/managing-tls-in-a-cluster/', tip: 'base64 -w 0 the .csr for the request field' },
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
    searchTip: 'Search "addons", find the Calico link from the K8s networking add-ons page.',
    subtitle: 'Install Calico via the Tigera operator, customize the IP pool CIDR, verify tigera-operator namespace.',
    docLinks: [
      { label: 'K8s networking add-ons', url: 'https://kubernetes.io/docs/concepts/cluster-administration/addons/', tip: 'Calico, Cilium, Flannel links' },
      { label: 'Network plugin requirements', url: 'https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/network-plugins/', tip: 'CNI conf at /etc/cni/net.d' },
    ],
    gotchas: [
      {
        title: 'Use kubectl create -f for tigera-operator.yaml, not apply -f',
        note: 'tigera-operator.yaml exceeds apply\'s 262144-byte annotation limit. apply silently fails.',
        cmd: 'kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.29.2/manifests/tigera-operator.yaml'
      },
      {
        title: 'CIDR override lives in custom-resources.yaml',
        note: 'Edit spec.calicoNetwork.ipPools[].cidr before applying.',
        cmd: `curl -O https://raw.githubusercontent.com/projectcalico/calico/v3.29.2/manifests/custom-resources.yaml
# ipPools:
# - cidr: 192.168.0.0/16   <-- default
# - cidr: 172.17.0.0/16    <-- your value
kubectl create -f custom-resources.yaml`
      },
      {
        title: 'Verify in calico-system, not kube-system',
        cmd: `kubectl get pods -n calico-system
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
    gotchas: [
      {
        title: 'apiVersion is gateway.networking.k8s.io/v1',
        note: 'Not networking.k8s.io.',
        cmd: 'apiVersion: gateway.networking.k8s.io/v1'
      },
      {
        title: 'Each listener needs a unique name',
        note: 'Required, even with one listener.',
        cmd: `spec:
  gatewayClassName: nginx
  listeners:
  - name: http
    protocol: HTTP
    port: 80`
      },
      {
        title: 'HTTPS = HTTPS + 443 + hostname + tls.certificateRefs',
        note: 'tls.mode defaults to Terminate. Cert secret must be in the Gateway\'s namespace, or use a ReferenceGrant.',
        cmd: `listeners:
- name: https
  protocol: HTTPS
  port: 443
  hostname: kodekloud.com
  tls:
    certificateRefs:
    - name: kodekloud-tls`
      },
      {
        title: 'Verify with describe; look for ACCEPTED',
        cmd: `kubectl describe gateway web-gateway -n nginx-gateway`
      },
      {
        title: 'HTTPRoute attaches via parentRefs',
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
      { label: 'Helm quickstart', url: 'https://helm.sh/docs/intro/quickstart/', tip: 'helm install, lint, ls' },
      { label: 'helm lint', url: 'https://helm.sh/docs/helm/helm_lint/', tip: 'Validate a chart before installing' },
      { label: 'helm upgrade', url: 'https://helm.sh/docs/helm/helm_upgrade/', tip: '--version pins chart version, --set overrides values' },
      { label: 'helm repo', url: 'https://helm.sh/docs/helm/helm_repo/', tip: 'helm repo update before upgrade' },
    ],
    gotchas: [
      {
        title: 'helm repo update before any version bump',
        note: 'Without it, the local index is stale and --version fails with "no chart version found".',
        cmd: `helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update`
      },
      {
        title: 'Install with concrete values',
        cmd: `helm install web bitnami/nginx \\
  --version 15.4.0 \\
  --namespace frontend \\
  --create-namespace \\
  --set image.tag=1.25 \\
  --set replicaCount=3`
      },
      {
        title: 'Upgrade to a new chart version',
        cmd: `helm repo update
helm upgrade lvm-crystal-apd lvm-crystal-apd/nginx \\
  --version 18.1.15 \\
  --namespace crystal-apd-ns \\
  --set replicaCount=2

helm ls -n crystal-apd-ns`
      },
      {
        title: 'helm install does not create the namespace',
        note: 'Pass --create-namespace, or kubectl create ns first.',
        cmd: `helm install web bitnami/nginx -n frontend --create-namespace

# or
kubectl create ns frontend
helm install web bitnami/nginx -n frontend`
      },
      {
        title: 'Lint before install',
        cmd: `helm lint ./webapp-color-apd/
helm install webapp-color-apd ./webapp-color-apd -n frontend-apd`
      },
      {
        title: '--set syntax: comma-separated, no spaces, dots for nesting',
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
    gotchas: [
      {
        title: 'kubeadm apiserver is on port 6443',
        note: 'If a kubeconfig has anything else, fix clusters[].cluster.server.',
        cmd: `kubectl --kubeconfig=/root/CKA/admin.kubeconfig get nodes
# server: https://controlplane:6443`
      },
      {
        title: 'Walk: kubelet → static pods → manifest → KUBECONFIG',
        cmd: `systemctl status kubelet
journalctl -u kubelet -n 50 --no-pager

sudo crictl ps -a | grep -E 'apiserver|etcd|scheduler|controller'
sudo crictl logs <container-id>

cat /etc/kubernetes/manifests/kube-apiserver.yaml | grep -E '(etcd|cert|key|client-ca)'

echo $KUBECONFIG
ls -l /etc/kubernetes/admin.conf`
      },
      {
        title: 'ResourceQuota: requests ≠ limits',
        note: '"Don\'t change limits" leaves requests fair game.',
        cmd: `kubectl edit deployment backend-api
# requests:
#   cpu: "50m"           # was 100m
#   memory: "90Mi"       # was 128Mi
# limits:
#   cpu: "150m"          # unchanged
#   memory: "150Mi"      # unchanged

# Stuck pods:
kubectl delete rs backend-api-7977bfdbd5`
      },
      {
        title: 'PVC binding: four matches, never edit the PV',
        note: 'storage size, accessModes, selector labels, storageClassName.',
        cmd: `kubectl get pv alpha-pv -o yaml
kubectl describe pvc -n alpha
kubectl edit pvc <pvc-name> -n alpha
# spec.resources.requests.storage: <= PV.capacity
# spec.accessModes: must overlap with PV
# spec.selector.matchLabels: must match PV.labels
# spec.storageClassName: must match`
      },
      {
        title: 'Kubelet auto-restarts on /etc/kubernetes/manifests/* edits',
        note: 'Edit, save, wait ~30s. No kubectl delete pod, no kubelet restart.',
        cmd: `vi /etc/kubernetes/manifests/kube-apiserver.yaml
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
