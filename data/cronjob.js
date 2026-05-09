// Questions for topic 'cronjob'. Loaded by index.html before js/questions.js,
// which concatenates all Q_* arrays into the global QUESTIONS.

const Q_CRONJOB = [
  {
    id: 'cj-1',
    topic: 'cronjob',
    difficulty: 'fail',
    title: 'CronJob: every 1 min, backoffLimit 25, activeDeadlineSeconds 20',
    scenario: 'Create a CronJob named <code>dice</code> that runs every minute. Image: <code>kodekloud/throw-dice</code>. It should:<br>• complete once (<code>completions: 1</code>)<br>• retry up to 25 times (<code>backoffLimit: 25</code>)<br>• fail if not done within 20 seconds (<code>activeDeadlineSeconds: 20</code>)<br>• use <code>restartPolicy: Never</code>',
    hint: {
      url: 'https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/#cronjob-spec',
      path: 'Concepts → CronJob → CronJob spec',
      tip: 'In the docs, look for the "jobTemplate.spec" section. backoffLimit and activeDeadlineSeconds are Job fields; they live under jobTemplate.spec, NOT the top-level CronJob spec.'
    },
    answer: {
      explanation: '<span class="highlight">The nesting trap:</span> CronJob.spec has schedule + jobTemplate. Job fields (backoffLimit, activeDeadlineSeconds) live inside jobTemplate.spec, one level deeper than you might expect.',
      yaml: `apiVersion: batch/v1
kind: CronJob
metadata:
  name: dice
spec:
  schedule: "*/1 * * * *"   # every 1 minute
  jobTemplate:
    spec:
      completions: 1
      backoffLimit: 25          # HERE (jobTemplate.spec)
      activeDeadlineSeconds: 20 # HERE (jobTemplate.spec)
      template:
        spec:
          containers:
          - name: dice
            image: kodekloud/throw-dice
          restartPolicy: Never  # must be Never or OnFailure in Jobs`
    }
  },
  {
    id: 'cj-2',
    topic: 'cronjob',
    difficulty: 'medium',
    title: 'CronJob: every 30 minutes, list processes with ps -eaf (run in shell)',
    scenario: 'In namespace <code>ckad-job</code>, create a CronJob named <code>simple-python-job</code> that runs every 30 minutes. Image: <code>python</code>. Run the command <code>ps -eaf</code> inside a shell (<code>/bin/sh -c</code>).',
    hint: {
      url: 'https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/',
      path: 'Concepts → CronJob',
      tip: 'The command must be run in a shell so it can be parsed. Use command: ["/bin/sh", "-c", "ps -eaf"]. Cron schedule for every 30 min: "*/30 * * * *"'
    },
    answer: {
      explanation: 'When a command needs shell features (pipes, env vars, etc.) use <code>/bin/sh -c "..."</code>. The imperative command also works here.',
      yaml: `# Imperative (fastest):
kubectl create cronjob simple-python-job \\
  -n ckad-job \\
  --image=python \\
  --schedule="*/30 * * * *" \\
  -- /bin/sh -c "ps -eaf"

---
# YAML:
apiVersion: batch/v1
kind: CronJob
metadata:
  name: simple-python-job
  namespace: ckad-job
spec:
  schedule: "*/30 * * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: simple-python-job
            image: python
            command:
            - /bin/sh
            - -c
            - ps -eaf
          restartPolicy: OnFailure`
    }
  },
  {
    id: 'cj-3',
    topic: 'cronjob',
    difficulty: 'medium',
    title: 'Job: compute pi to 1024 places, backoffLimit 5, activeDeadlineSeconds 100',
    scenario: "In namespace <code>ckad-job</code>, create a Job named <code>very-long-pi</code>. Image: <code>perl:5.34.0</code>. Command: <code>perl -Mbignum=bpi -wle 'print bpi(1024)'</code>. Max 5 retries. Fail if not done in 100 seconds.",
    hint: {
      url: 'https://kubernetes.io/docs/concepts/workloads/controllers/job/',
      path: 'Concepts → Workload Management → Job',
      tip: 'In the Job spec (not CronJob), backoffLimit and activeDeadlineSeconds sit directly under spec, they are Job fields. Look for the "Writing a Job spec" section in the docs.'
    },
    answer: {
      explanation: 'In a standalone Job, backoffLimit and activeDeadlineSeconds are at <code>spec</code> level, no jobTemplate wrapper needed (that wrapper is only for CronJobs).',
      yaml: `apiVersion: batch/v1
kind: Job
metadata:
  name: very-long-pi
  namespace: ckad-job
spec:
  backoffLimit: 5              # direct on spec (it's a Job, not CronJob)
  activeDeadlineSeconds: 100   # direct on spec
  template:
    spec:
      containers:
      - name: pi
        image: perl:5.34.0
        command:
        - perl
        - -Mbignum=bpi
        - -wle
        - print bpi(1024)
      restartPolicy: Never`
    }
  },
  {
    id: 'me5-1',
    topic: 'cronjob',
    difficulty: 'medium',
    title: 'CronJob: print a message every hour, restartPolicy OnFailure',
    scenario: 'In namespace <code>ckad-job</code> on <code>cluster2</code>, create a CronJob named <code>learning-every-hour</code> that runs every hour at minute 0 and prints: <code>I will pass CKAD certification</code>. Use image <code>alpine</code>. If the container fails for any reason, it should restart automatically.',
    hint: {
      url: 'https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/',
      path: 'Concepts → Workload Management → CronJob',
      tip: '"Every hour at minute 0" = "0 * * * *" (first field is minutes). restartPolicy: OnFailure means the container will restart on non-zero exit, use this when you want automatic retry but not Always (which is invalid in Jobs).'
    },
    answer: {
      explanation: `<span class="highlight">restartPolicy choices in Jobs/CronJobs:</span> <code>Never</code> = don't restart, just mark failed. <code>OnFailure</code> = restart the container in-place if it exits non-zero. <code>Always</code> is NOT valid in Job/CronJob pods.`,
      yaml: `apiVersion: batch/v1
kind: CronJob
metadata:
  name: learning-every-hour
  namespace: ckad-job
spec:
  schedule: "0 * * * *"       # minute 0 of every hour
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: learning-every-hour
            image: alpine
            imagePullPolicy: IfNotPresent
            command:
            - /bin/sh
            - -c
            - echo I will pass CKAD certification
          restartPolicy: OnFailure  # NOT Always, hat's invalid in Jobs`
    }
  }
];
