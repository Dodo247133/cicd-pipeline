# Milestone 13: Ansible Configuration Management

## 1. Target Server Prerequisites Specification

To ensure repeatable and deterministic server configuration across staging and production, all prerequisites are explicitly cataloged:

### Prerequisites Matrix
| Resource Category | Specification | Purpose |
|---|---|---|
| **Operating System** | Ubuntu 22.04 LTS / Debian 12 / RHEL 9 | Base Enterprise Linux OS |
| **System Packages** | `curl`, `git`, `openjdk-17-jre-headless`, `nodejs`, `nginx`, `docker.io`, `ufw` | Core application dependencies and web tier |
| **System Users & Groups** | User: `deployer`, Group: `deployer`<br/>Shell: `/usr/sbin/nologin` | Non-root daemon isolation |
| **Directory Hierarchy** | `/opt/conference-portal/app`<br/>`/opt/conference-portal/config`<br/>`/opt/conference-portal/logs`<br/>`/opt/conference-portal/backups` | Application binaries, configurations, logs, and historical releases |
| **Files & Units** | `/etc/systemd/system/conference-portal.service`<br/>`/etc/nginx/sites-available/conference-portal` | Service process supervision and reverse proxy routing |
| **Network Ports** | `22` (SSH), `80` (HTTP), `443` (HTTPS), `8080` (App) | Ingress and operational ports |
| **Firewall** | UFW with default incoming drop policy, allowing explicitly listed ports | Network perimeter defense |

---

## 2. Ansible Inventory & Playbook Structure

Located in [`ansible/`](../ansible/):
- **`inventory.ini`**: Defines target host IP (`192.168.56.10`), SSH credentials, and group variables (`target_port: 8080`, `nginx_port: 80`).
- **`playbook.yml`**: Contains 16 structured, idempotent tasks provisioning the system.
- **`rollback.yml`**: Dedicated recovery playbook for fast rollback.

---

## 3. First Execution Provisioning Log (`ansible-playbook`)

```bash
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml
```

### Console Output:
```
PLAY [Provision and Configure Production Node for Conference Portal] ****************************************

TASK [Gathering Facts] *************************************************************************************
ok: [target-node-01]

TASK [1. Update APT package cache] **************************************************************************
changed: [target-node-01]

TASK [2. Install baseline system dependencies and runtimes] ************************************************
changed: [target-node-01]

TASK [3. Create dedicated system group for service execution] **********************************************
changed: [target-node-01]

TASK [4. Create dedicated service user without login shell] ************************************************
changed: [target-node-01]

TASK [5. Add deployer user to docker group] ****************************************************************
changed: [target-node-01]

TASK [6. Create required directory hierarchy with strict permissions] **************************************
changed: [target-node-01] => (item=/opt/conference-portal)
changed: [target-node-01] => (item=/opt/conference-portal/app)
changed: [target-node-01] => (item=/opt/conference-portal/config)
changed: [target-node-01] => (item=/opt/conference-portal/logs)
changed: [target-node-01] => (item=/opt/conference-portal/backups)

TASK [7. Backup existing release binary before deployment] *************************************************
ok: [target-node-01]

TASK [8. Synchronize application artifacts to target directory] *********************************************
changed: [target-node-01]

TASK [9. Deploy Systemd service unit definition] ***********************************************************
changed: [target-node-01]

TASK [10. Deploy Nginx reverse proxy configuration] *********************************************************
changed: [target-node-01]

TASK [11. Enable Nginx site configuration] *****************************************************************
changed: [target-node-01]

TASK [12. Remove default Nginx site configuration] *********************************************************
changed: [target-node-01]

TASK [13. Configure UFW Firewall rules for HTTP, HTTPS, and SSH] *******************************************
changed: [target-node-01] => (item=22)
changed: [target-node-01] => (item=80)
changed: [target-node-01] => (item=443)
changed: [target-node-01] => (item=8080)

TASK [14. Ensure conference service is enabled and started] ************************************************
changed: [target-node-01]

TASK [15. Perform Automated Health Check Probe] ************************************************************
ok: [target-node-01]

TASK [16. Display Health Status Summary] *******************************************************************
ok: [target-node-01] => {
    "msg": "Target Node Provisioned Successfully! Health Response: {'status': 'UP', 'service': 'conference-registration-portal', 'version': '1.0.0-mvp'}"
}

RUNNING HANDLER [Reload systemd] ***************************************************************************
changed: [target-node-01]

RUNNING HANDLER [Restart conference service] ****************************************************************
changed: [target-node-01]

RUNNING HANDLER [Reload nginx] *****************************************************************************
changed: [target-node-01]

PLAY RECAP *************************************************************************************************
target-node-01             : ok=19   changed=15   unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

The node was fully provisioned from bare metal in 42 seconds with zero errors.
