function buildHelpText(t) {
  return `${t("terminal.messages.availableCommands")}

  whoami              ${t("terminal.help.whoami")}
  neofetch            ${t("terminal.help.neofetch")}
  cat resume.txt      ${t("terminal.help.resume")}
  sudo hire-me        ${t("terminal.help.hire")}
  ls                  ${t("terminal.help.ls")}
  ls -la              ${t("terminal.help.lsLa")}
  pwd                 ${t("terminal.help.pwd")}
  hostname            ${t("terminal.help.hostname")}
  date                ${t("terminal.help.date")}
  uname -a            ${t("terminal.help.uname")}
  history             ${t("terminal.help.history")}
  echo <text>         ${t("terminal.help.echo")}
  clear               ${t("terminal.help.clear")}
  exit                ${t("terminal.help.exit")}

  kubectl get ns                       ${t("terminal.help.ns")}
  kubectl get pods [-n <namespace>]    ${t("terminal.help.pods")}
  kubectl get deploy [-n <namespace>]  ${t("terminal.help.deploy")}
  kubectl get svc [-n <namespace>]     ${t("terminal.help.svc")}
  kubectl get nodes                    ${t("terminal.help.nodes")}

  ${t("terminal.help.defaultNs")}
  ${t("terminal.help.hint")}

${t("terminal.help.footer")}`;
}

function buildResumeText(t) {
  return `
 +-------------------------------------------------+
 |     Jose Camilo Joga Guerrero                    |
 |     ${t("terminal.messages.resumeLocation") === "Location" ? "DevOps & Cloud Engineer" : "Ingeniero DevOps y Cloud"}                      |
 +-------------------------------------------------+

  ${t("terminal.messages.resumeLocation").padEnd(8)} : Santo Domingo, Dominican Republic
  Email    : josejoga.opx@gmail.com
  LinkedIn : linkedin.com/in/cjoga
  Web      : cjoga.cloud

  ${t("terminal.messages.resumeExperience")}
  ----------
  Arroyo Consulting    DevOps Engineer       2025 - Present
  Shadow-Soft          DevOps Consultant     2022 - Present

  ${t("terminal.messages.resumeCertifications")}
  --------------
  * AWS Certified Solutions Architect
  * HashiCorp Certified Terraform Associate
  * RHCSA & RHCE
  * Dynatrace Associate
  * GitLab Certified (4x)

  ${t("terminal.messages.resumeSkills")}
  ------
  AWS | Azure | Terraform | Ansible | Kubernetes
  Docker | GitLab CI | ArgoCD | Prometheus | Grafana
  Linux | Python | Bash | Git | Helm

  ${t("terminal.messages.resumeHireTip")}
`;
}

const NEOFETCH_OUTPUT = `
        ######                visitor@cjoga.cloud
       ##    ##               ---------------------
      ##      ##              OS: K3s on Debian GNU/Linux 12
     ##   ##   ##             Host: Homelab Cluster (ARM64)
     ##   ##   ##             Kernel: 6.1.0-k3s1
      ##      ##              Shell: cjoga-terminal 1.0
       ##    ##               Uptime: since 2022
        ######                Packages: AWS, K8s, Terraform, Ansible
                              Resolution: Full-Stack
    c j o g a . c l o u d     WM: Kubernetes + ArgoCD
                              Theme: DevOps [Dark]
                              Terminal: JetBrains Mono
                              CPU: Passion x Dedication @ 100%
                              Memory: Infinite Learning / Infinite Capacity
`;

function buildHireMeText(t) {
  return `
 +==========================================+
 |                                          |
 |   ${t("terminal.messages.hireGranted").padEnd(37)}|
 |                                          |
 |   ${t("terminal.messages.hireCta").padEnd(37)}|
 |                                          |
 |   Email    : josejoga.opx@gmail.com      |
 |   LinkedIn : linkedin.com/in/cjoga       |
 |   Web      : cjoga.cloud                 |
 |                                          |
 |   ${t("terminal.messages.hireStatus").padEnd(37)}|
 |                                          |
 +==========================================+
`;
}

const LS_OUTPUT = "resume.txt  projects/  certifications/  blog/  .secret-plans";

function buildLsLaOutput() {
  const now = new Date();
  const mon = now.toLocaleString("en-US", { month: "short" });
  const day = String(now.getDate()).padStart(2, " ");
  const time = now.toTimeString().slice(0, 5);
  const ts = `${mon} ${day} ${time}`;
  return `total 42
drwxr-xr-x  6 camilo devops  4096 ${ts} .
drwxr-xr-x  3 root   root    4096 ${ts} ..
-rw-r--r--  1 camilo devops  2048 ${ts} resume.txt
drwxr-xr-x  2 camilo devops  4096 ${ts} projects
drwxr-xr-x  2 camilo devops  4096 ${ts} certifications
drwxr-xr-x  2 camilo devops  4096 ${ts} blog
-rw-------  1 camilo devops   512 ${ts} .secret-plans`;
}

const CLIENT_COMMANDS = {
  help: (t) => ({ output: buildHelpText(t), type: "info" }),
  clear: () => ({ output: null, type: "clear" }),
  date: () => ({ output: new Date().toString(), type: "success" }),
  whoami: () => ({ output: "visitor", type: "success" }),
  hostname: () => ({ output: "cjoga.cloud", type: "success" }),
  pwd: () => ({ output: "/home/visitor", type: "success" }),
  "uname -a": () => ({
    output:
      "Linux cjoga.cloud 6.1.0-k3s1 #1 SMP PREEMPT_DYNAMIC K3s aarch64 GNU/Linux",
    type: "success",
  }),
  ls: () => ({ output: LS_OUTPUT, type: "success" }),
  "ls -la": () => ({ output: buildLsLaOutput(), type: "success" }),
  "ls -l": () => ({ output: buildLsLaOutput(), type: "success" }),
  "ls -al": () => ({ output: buildLsLaOutput(), type: "success" }),
  "cat resume.txt": (t) => ({ output: buildResumeText(t), type: "success" }),
  "cat .secret-plans": (t) => ({
    output: `cat: .secret-plans: Permission denied\n${t("terminal.messages.secretDenied")}`,
    type: "error",
  }),
  neofetch: () => ({ output: NEOFETCH_OUTPUT, type: "success" }),
  fastfetch: () => ({ output: NEOFETCH_OUTPUT, type: "success" }),
  "sudo hire-me": (t) => ({ output: buildHireMeText(t), type: "success" }),
  exit: (t) => ({
    output: `${t("terminal.messages.logout")}\n${t("terminal.messages.connectionClosed")}`,
    type: "exit",
  }),
  cd: (t) => ({
    output: `bash: cd: ${t("terminal.messages.cdRestricted")}`,
    type: "error",
  }),
  rm: (t) => ({
    output: `bash: rm: ${t("terminal.messages.rmReadOnly")}`,
    type: "error",
  }),
  "rm -rf /": (t) => ({
    output: `bash: rm: ${t("terminal.messages.rmBold")}`,
    type: "error",
  }),
  "rm -rf": (t) => ({
    output: `bash: rm: ${t("terminal.messages.rmBold")}`,
    type: "error",
  }),
  vim: (t) => ({
    output: `bash: vim: ${t("terminal.messages.vimJoke")}`,
    type: "error",
  }),
  nano: (t) => ({
    output: `bash: nano: ${t("terminal.messages.nanoReadOnly")}`,
    type: "error",
  }),
  top: () => ({
    output: `  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM
    1 camilo    20   0  512000  32000  16000 S   0.3   6.2  node
   42 camilo    20   0  256000  16000   8000 S   0.1   3.1  nginx
   99 visitor   20   0    4096   1024    512 R   100  99.9  curiosity`,
    type: "success",
  }),
  htop: (t) => ({
    output: `bash: htop: ${t("terminal.messages.htopNotFound")}`,
    type: "error",
  }),
  "cat /etc/passwd": (t) => ({
    output: `cat: /etc/passwd: Permission denied\n${t("terminal.messages.passwdDenied")}`,
    type: "error",
  }),
  id: () => ({
    output: "uid=1000(visitor) gid=1000(guests) groups=1000(guests),27(curious-people)",
    type: "success",
  }),
  uptime: () => ({
    output: ` ${new Date().toTimeString().split(" ")[0]} up since 2022, 1 user, load average: 0.42, 0.42, 0.42`,
    type: "success",
  }),
};

export function resolveClientCommand(input, commandHistory, t) {
  const trimmed = input.trim();
  const normalized = trimmed.toLowerCase().replace(/\s+/g, " ");

  // Check exact matches first
  const handler = CLIENT_COMMANDS[normalized];
  if (handler) return handler(t);

  // Echo command
  if (normalized.startsWith("echo ")) {
    return { output: trimmed.slice(5), type: "success" };
  }
  if (normalized === "echo") {
    return { output: "", type: "success" };
  }

  // History command
  if (normalized === "history") {
    if (commandHistory.length === 0) return { output: t("terminal.messages.noHistory"), type: "info" };
    const output = commandHistory
      .map((cmd, i) => `  ${String(i + 1).padStart(4)}  ${cmd}`)
      .join("\n");
    return { output, type: "success" };
  }

  // Sudo anything else
  if (normalized.startsWith("sudo ") && normalized !== "sudo hire-me") {
    return {
      output: `[sudo] password for visitor: \n${t("terminal.messages.sudoDenied")}\n\n(${t("terminal.messages.sudoHint")})`,
      type: "error",
    };
  }

  // Cat anything else
  if (normalized.startsWith("cat ") && !CLIENT_COMMANDS[normalized]) {
    const file = trimmed.split(" ").slice(1).join(" ");
    return {
      output: `cat: ${file}: ${t("terminal.messages.fileNotFound")}`,
      type: "error",
    };
  }

  // cd with arguments
  if (normalized.startsWith("cd ")) {
    return {
      output: `bash: cd: ${t("terminal.messages.cdRestricted")}`,
      type: "error",
    };
  }

  // rm with arguments
  if (normalized.startsWith("rm ")) {
    return {
      output: `bash: rm: ${t("terminal.messages.rmReadOnly")}`,
      type: "error",
    };
  }

  // Kubectl commands -> delegate to server
  if (normalized.startsWith("kubectl")) {
    return null;
  }

  // Unknown command -> delegate to server (will return "not found")
  return null;
}
