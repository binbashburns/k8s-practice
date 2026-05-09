// Questions for topic 'cka-jsonpath'. Loaded by index.html before js/questions.js,
// which concatenates all Q_* arrays into the global QUESTIONS.

const Q_CKA_JSONPATH = [
  {
    id: 'cka-jp-1',
    topic: 'cka-jsonpath',
    difficulty: 'fail',
    title: 'List deployments as table: NAME, IMAGE, READY, NAMESPACE, sorted by name',
    scenario: `Print the deployments in namespace <code>admin2406</code> in this format and write to <code>/opt/admin2406_data</code>:<br><br>
<code>DEPLOYMENT&nbsp;&nbsp;&nbsp;CONTAINER_IMAGE&nbsp;&nbsp;&nbsp;READY_REPLICAS&nbsp;&nbsp;&nbsp;NAMESPACE</code><br>
<code>deploy0&nbsp;&nbsp;&nbsp;nginx:alpine&nbsp;&nbsp;&nbsp;1&nbsp;&nbsp;&nbsp;admin2406</code><br><br>
Sort by deployment name ascending.`,
    hint: {
      url: 'https://kubernetes.io/docs/reference/kubectl/quick-reference/',
      path: 'Reference → kubectl Cheat Sheet (search "custom-columns")',
      tip: 'Pattern: kubectl get <kind> -o custom-columns=<HEADER>:.<jsonpath>,<HEADER>:.<jsonpath> --sort-by=<jsonpath>. The cheat sheet has copy-paste examples, quicker than the JSONPath reference.'
    },
    answer: {
      explanation: 'Container image path uses <code>[]</code> (no index = first container). <code>--sort-by</code> goes outside the custom-columns string. No spaces between fields.',
      yaml: `kubectl -n admin2406 get deployment \\
  -o custom-columns=DEPLOYMENT:.metadata.name,CONTAINER_IMAGE:.spec.template.spec.containers[].image,READY_REPLICAS:.status.readyReplicas,NAMESPACE:.metadata.namespace \\
  --sort-by=.metadata.name \\
  > /opt/admin2406_data

# Verify formatting
cat /opt/admin2406_data

# Memorize these jsonpaths (no leading dot inside custom-columns):
#   .metadata.name
#   .metadata.namespace
#   .spec.template.spec.containers[].image     <-- [] means "all", first by default
#   .status.readyReplicas`
    }
  },
  {
    id: 'cka-jp-2',
    topic: 'cka-jsonpath',
    difficulty: 'medium',
    title: 'Get all pod IPs across all namespaces sorted by IP',
    scenario: 'Write all pod names and pod IPs (across all namespaces) to <code>/root/pod_ips.txt</code>, sorted ascending by IP. Format: <code>POD_NAME&nbsp;&nbsp;&nbsp;&nbsp;IP_ADDR</code>.',
    hint: {
      url: 'https://kubernetes.io/docs/reference/kubectl/generated/kubectl_get/',
      path: 'Reference → kubectl → kubectl get',
      tip: '-A means all namespaces. --sort-by takes a jsonpath WITH leading dot. custom-columns paths do NOT have leading dot.'
    },
    answer: {
      explanation: 'Two gotchas: <code>--sort-by</code> needs a leading dot, but the paths inside <code>custom-columns</code> do not.',
      yaml: `kubectl get pods -A \\
  -o=custom-columns='POD_NAME:metadata.name,IP_ADDR:status.podIP' \\
  --sort-by=.status.podIP \\
  > /root/pod_ips.txt

# Inspect:
head -5 /root/pod_ips.txt`
    }
  },
  {
    id: 'cka-jp-3',
    topic: 'cka-jsonpath',
    difficulty: 'medium',
    title: 'JSONPath: extract a single field with -o jsonpath',
    scenario: 'Print just the container image of the pod <code>nginx</code> in the default namespace. Then print the names of all nodes in a space-separated list.',
    hint: {
      url: 'https://kubernetes.io/docs/reference/kubectl/jsonpath/',
      path: 'Reference → kubectl → JSONPath Support',
      tip: 'jsonpath uses {} brackets around the expression. {.spec.containers[0].image} for one image. {range .items[*]}{.metadata.name}{" "}{end} to iterate.'
    },
    answer: {
      explanation: 'JSONPath wraps the expression in <code>{}</code>. <code>range</code> + <code>end</code> iterates a list. The single-quote around the whole expression keeps shell from eating the braces.',
      yaml: `# Single field
kubectl get pod nginx -o jsonpath='{.spec.containers[0].image}'

# Iterate over a list (all node names, space-separated)
kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name}{" "}{end}'

# Multi-field with literals
kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\\t"}{.status.podIP}{"\\n"}{end}'

# All container images in cluster, deduped (common interview/exam question)
kubectl get pods -A -o jsonpath='{.items[*].spec.containers[*].image}' | tr ' ' '\\n' | sort -u`
    }
  }
];
