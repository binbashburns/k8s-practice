// Questions for topic 'cka-helm'. Loaded by index.html before js/questions.js,
// which concatenates all Q_* arrays into the global QUESTIONS.

const Q_CKA_HELM = [
  {
    id: 'dep-4',
    topic: 'cka-helm',
    difficulty: 'hard',
    title: 'Helm: fix chart issues and install to specific namespace',
    scenario: 'A Helm chart is at <code>/opt/webapp-color-apd/</code>. Fix these issues and install as release <code>webapp-color-apd</code> in namespace <code>frontend-apd</code>: (1) Deployment apiVersion is wrong, (2) service template has a typo in a variable, (3) appVersion should be 1.20.0, (4) replicaCount should be 3, (5) service type should be NodePort.',
    hint: {
      url: 'https://helm.sh/docs/helm/helm_lint/',
      path: 'helm.sh → Helm Commands → helm lint',
      tip: 'Run "helm lint ./chart-dir" to find template errors before installing. Check Chart.yaml for appVersion, values.yaml for replicaCount and service.type. Template variables like {{ .Values.service.name }} are case-sensitive.'
    },
    answer: {
      explanation: 'Always lint first. Create the namespace before installing.',
      yaml: `# 1. Create namespace if needed
kubectl create ns frontend-apd

# 2. Lint to find errors
cd /opt
helm lint ./webapp-color-apd/
# will show: wrong apiVersion, typo in template variable

# 3. Fix Chart.yaml
#    appVersion: "1.20.0"

# 4. Fix values.yaml
#    replicaCount: 3
#    service:
#      type: NodePort

# 5. Fix templates/deployment.yaml
#    apiVersion: apps/v1  (not just v1)

# 6. Fix template variable typo in service.yaml
#    {{ .Values.service.name }}  (check exact casing)

# 7. Lint again to confirm clean
helm lint ./webapp-color-apd/

# 8. Install
helm install webapp-color-apd -n frontend-apd ./webapp-color-apd

# 9. Verify
helm ls -n frontend-apd`
    }
  },
  {
    id: 'me5-3',
    topic: 'cka-helm',
    difficulty: 'medium',
    title: 'Helm: repo update then upgrade chart version and set replicaCount',
    scenario: 'A Helm release named <code>lvm-crystal-apd</code> (nginx chart) is deployed on <code>cluster3</code> in namespace <code>crystal-apd-ns</code>. The team has pushed a new chart version. Update the Helm repo, then upgrade the release to chart version <code>18.1.15</code> with <code>replicaCount=2</code>. Do this on the <code>cluster3-controlplane</code> node.',
    hint: {
      url: 'https://helm.sh/docs/helm/helm_upgrade/',
      path: 'helm.sh → Helm Commands → helm upgrade',
      tip: 'Always run "helm repo update" before upgrading to fetch the latest chart metadata, without it you may not see the new version. The --version flag pins the chart version (not the app version). --set overrides a single values.yaml key inline.'
    },
    answer: {
      explanation: `<span class="highlight">helm repo update is mandatory</span> before --version bumps. Without it the local index is stale and the new chart version won't resolve.`,
      yaml: `# SSH to the controlplane first
ssh cluster3-controlplane

# 1. Update repo cache
helm repo update

# 2. Upgrade with specific chart version and overridden value
helm upgrade lvm-crystal-apd lvm-crystal-apd/nginx \\
  --version=18.1.15 \\
  --namespace=crystal-apd-ns \\
  --set replicaCount=2

# 3. Verify
helm ls -n crystal-apd-ns
kubectl get pods -n crystal-apd-ns`
    }
  },
  {
    id: 'cka-helm-3',
    topic: 'cka-helm',
    difficulty: 'medium',
    title: 'Lint a local chart, install as new release, uninstall old release',
    scenario: 'Release <code>webpage-server-01</code> is deployed in the default namespace. A new chart sits at <code>/root/new-version</code>. Lint it, install as a new release named <code>webpage-server-02</code>, then uninstall <code>webpage-server-01</code>.',
    hint: {
      url: 'https://helm.sh/docs/helm/helm_lint/',
      path: 'helm.sh → Helm Commands → helm lint',
      tip: 'helm lint ./path validates chart structure. helm install <release> ./path. helm uninstall <release> -n <ns> removes a release. helm ls -A to confirm what is installed before and after.'
    },
    answer: {
      explanation: 'Lint before install to catch template/syntax errors. Names are arbitrary, the new release simply runs alongside the old until you uninstall it.',
      yaml: `# 1. See current releases
helm ls -n default

# 2. Lint the new chart
cd /root
helm lint ./new-version

# 3. Install as new release
helm install webpage-server-02 ./new-version

# 4. Uninstall the old release
helm uninstall webpage-server-01 -n default

# 5. Verify
helm ls -n default`
    }
  }
];
