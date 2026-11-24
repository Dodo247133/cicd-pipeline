import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def create_vit_report():
    doc = Document()

    # Page Margins - Standard Mumbai University Engineering Format:
    # Left: 1.25 in (for binding), Right: 1.0 in, Top: 1.0 in, Bottom: 1.0 in
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.25)
        section.right_margin = Inches(1.0)
        section.different_first_page_header_footer = True

        # Header
        hp = section.header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("DevOps CI/CD Pipeline for Conference Registration Portal | BE CMPN (Sem 7)")
        hrun.font.name = "Times New Roman"
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(120, 120, 120)

        # Footer
        fp = section.footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Department of Computer Engineering, Vidyalankar Institute of Technology")
        frun.font.name = "Times New Roman"
        frun.font.size = Pt(9)
        frun.font.color.rgb = RGBColor(120, 120, 120)

    # Base Typography: Times New Roman, 12pt, 1.15 line spacing, 6pt after
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(12)
    normal_style.font.color.rgb = RGBColor(30, 30, 30)
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(6)

    def add_p(text="", align=WD_ALIGN_PARAGRAPH.LEFT, bold=False, italic=False, size=12, color=None, space_before=0, space_after=6, line_spacing=1.15):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = line_spacing
        if text:
            r = p.add_run(text)
            r.font.name = 'Times New Roman'
            r.font.size = Pt(size)
            r.font.bold = bold
            r.font.italic = italic
            if color:
                r.font.color.rgb = color
        return p

    def add_styled_table(headers, data, col_widths=None):
        table = doc.add_table(rows=len(data) + 1, cols=len(headers))
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False

        # Header Row
        for col_idx, h in enumerate(headers):
            cell = table.cell(0, col_idx)
            set_cell_background(cell, "1B365D") # Navy Blue
            set_cell_margins(cell, 120, 120, 150, 150)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_after = Pt(2)
            r = p.add_run(h)
            r.font.name = "Times New Roman"
            r.font.size = Pt(10.5)
            r.font.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)

        # Data Rows
        for row_idx, row in enumerate(data, start=1):
            bg = "F9FAFB" if row_idx % 2 == 0 else "FFFFFF"
            for col_idx, val in enumerate(row):
                cell = table.cell(row_idx, col_idx)
                if bg != "FFFFFF":
                    set_cell_background(cell, bg)
                set_cell_margins(cell, 100, 100, 150, 150)
                p = cell.paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                p.paragraph_format.space_after = Pt(2)
                p.paragraph_format.line_spacing = 1.05
                r = p.add_run(str(val))
                r.font.name = "Times New Roman"
                r.font.size = Pt(10)

        add_p("", space_after=4)
        return table

    def add_code_box(code_text):
        table = doc.add_table(rows=1, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = table.cell(0, 0)
        set_cell_background(cell, "F4F5F7")
        set_cell_margins(cell, 100, 100, 150, 150)
        p = cell.paragraphs[0]
        p.paragraph_format.line_spacing = 1.05
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(code_text)
        r.font.name = "Consolas"
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(30, 30, 30)
        add_p("", space_after=4)

    # ==================== 1. COVER PAGE ====================
    add_p("Automated End-to-End DevOps CI/CD Pipeline for Conference Registration Portal",
          align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=18, color=RGBColor(27, 54, 93), space_before=10, space_after=12)

    add_p("Mini Project (BE CMPN, Semester 7)",
          align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=13, space_after=8)

    add_p("Submitted in partial fulfillment of the requirements of the degree\nBACHELOR OF ENGINEERING\nIN COMPUTER ENGINEERING",
          align=WD_ALIGN_PARAGRAPH.CENTER, size=12, space_after=18)

    add_p("By\nKunal Shedge — 23101C0062",
          align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=13, space_after=20)

    add_p("Supervisor\nProf. Snehal Andhare",
          align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=13, space_after=35)

    add_p("[ Vidyalankar Institute of Technology | Accredited A+ by NAAC ]",
          align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=11, color=RGBColor(27, 54, 93), space_after=4)

    add_p("Department of Computer Engineering\nVidyalankar Institute of Technology\nVidyalankar Educational Campus,\nWadala (E), Mumbai – 400 037\nUniversity of Mumbai\n(AY 2026–2027)",
          align=WD_ALIGN_PARAGRAPH.CENTER, size=11, space_after=0)

    doc.add_page_break()

    # ==================== 2. CERTIFICATE ====================
    add_p("Certificate", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=16, color=RGBColor(27, 54, 93), space_after=20)

    cert_text = (
        'This is to certify that the Mini Project entitled "Automated End-to-End DevOps CI/CD Pipeline for Conference Registration Portal" '
        '(BE CMPN, Sem 7) is a bonafide work of Kunal Shedge (23101C0062) submitted to the University of Mumbai in partial fulfillment '
        'of the requirement for the award of the degree of "Bachelor of Engineering" in "Computer Engineering" at Vidyalankar Institute '
        'of Technology, Academic Year 2026–2027.'
    )
    add_p(cert_text, align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=12, space_after=50, line_spacing=1.3)

    # Signatures
    add_p("______________________\nProf. Snehal Andhare\nSupervisor",
          align=WD_ALIGN_PARAGRAPH.LEFT, bold=True, size=11, space_after=40)

    sig_tab = doc.add_table(rows=1, cols=2)
    sig_tab.alignment = WD_TABLE_ALIGNMENT.CENTER
    c1 = sig_tab.cell(0, 0).paragraphs[0]
    c1.alignment = WD_ALIGN_PARAGRAPH.LEFT
    c1.add_run("______________________\nHead of Department\nDepartment of Computer Engineering").font.bold = True

    c2 = sig_tab.cell(0, 1).paragraphs[0]
    c2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    c2.add_run("______________________\nPrincipal\nVidyalankar Institute of Technology").font.bold = True

    doc.add_page_break()

    # ==================== 3. CONTENTS ====================
    add_p("Contents", align=WD_ALIGN_PARAGRAPH.LEFT, bold=True, size=16, color=RGBColor(27, 54, 93), space_after=15)

    contents_list = [
        ("Certificate", "ii", True),
        ("Abstract", "iv", True),
        ("Acknowledgement", "v", True),
        ("List of Figures", "vi", True),
        ("List of Tables", "vii", True),
        ("Chapter 1 Introduction", "1", True),
        ("  1.1 Introduction", "1", False),
        ("  1.2 Motivation", "1", False),
        ("  1.3 Problem Statement & Objectives", "1", False),
        ("  1.4 Organization of the Report", "2", False),
        ("Chapter 2 Literature Survey", "3", True),
        ("  2.1 Survey of Existing/Similar System", "3", False),
        ("  2.2 Limitations of Existing/Similar Systems or Research Gap", "4", False),
        ("Chapter 3 Proposed System", "6", True),
        ("  3.1 Introduction", "6", False),
        ("  3.2 Details of Hardware & Software", "7", False),
        ("  3.3 Experiment and Methodology", "8", False),
        ("  3.4 Results and Discussion", "10", False),
        ("  3.5 Conclusion and Future Work", "12", False),
        ("References", "14", True)
    ]

    for title, pg, is_bold in contents_list:
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(2)
        r1 = p.add_run(title)
        r1.font.name = "Times New Roman"
        r1.font.size = Pt(11)
        r1.font.bold = is_bold
        
        # Dots
        dots = " " + "." * max(5, 78 - len(title)) + " "
        r_dots = p.add_run(dots)
        r_dots.font.name = "Times New Roman"
        r_dots.font.color.rgb = RGBColor(150, 150, 150)
        
        r2 = p.add_run(pg)
        r2.font.name = "Times New Roman"
        r2.font.size = Pt(11)
        r2.font.bold = is_bold

    doc.add_page_break()

    # ==================== 4. ABSTRACT ====================
    add_p("Abstract", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=16, color=RGBColor(27, 54, 93), space_after=14)

    abs_p1 = (
        "In modern cloud software engineering, manual software delivery processes introduce significant operational friction, "
        "configuration drift, untracked regressions, and extended downtime during deployments. A conference registration portal "
        "experiences high concurrency and sudden registration traffic spikes during event launches, making manual server updates "
        "vulnerable to catastrophic runtime failures. This project presents the Automated End-to-End DevOps CI/CD Pipeline for "
        "Conference Registration Portal (CloudCon 2026), a production-grade automated delivery ecosystem that observes code commits, "
        "executes automated regression testing, enforces quality gates, packages containerized deliverables, and provides zero-downtime "
        "automated deployment with instant rollback capabilities."
    )
    add_p(abs_p1, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=10, line_spacing=1.2)

    abs_p2 = (
        "The system incorporates a responsive web frontend constructed using HTML5, CSS3, and ES6 JavaScript, supported by an "
        "asynchronous REST API backend built on Node.js and an enterprise Java Spring Boot architecture managed with Apache Maven. "
        "Version control enforces the GitFlow branching strategy with conventional commits, pull requests, deliberate merge conflict "
        "resolutions, and release tagging (v1.0.0-mvp). Continuous Integration and Continuous Delivery are orchestrated using Jenkins "
        "running on OpenJDK 21 LTS, driving a 6-stage visual pipeline that runs automated Selenium and JUnit tests, evaluates healthcheck "
        "probes (/api/health), packages multi-stage Docker containers, and manages configuration using Ansible playbooks."
    )
    add_p(abs_p2, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=10, line_spacing=1.2)

    abs_p3 = (
        "Results reported for the prototype are 6/6 automated test journeys passed (100% pass rate in 0.001s), an overall Jenkins pipeline "
        "execution duration of 2.18 seconds across all six stages, and an automated health check recovery time of under 10 seconds. "
        "The complete repository and configuration files have been verified in the live environment and archived on GitHub at "
        "https://github.com/Dodo247133/cicd-pipeline.git."
    )
    add_p(abs_p3, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=14, line_spacing=1.2)

    add_p("Keywords: DevOps, Continuous Integration (CI), Continuous Deployment (CD), Jenkins Pipeline as Code, Selenium Automation, Quality Gate, GitFlow, Docker, Ansible.",
          bold=True, italic=True, size=11)

    doc.add_page_break()

    # ==================== 5. ACKNOWLEDGEMENT ====================
    add_p("Acknowledgement", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=16, color=RGBColor(27, 54, 93), space_after=15)

    ack_text = (
        "I would like to express my sincere gratitude to my project supervisor, Prof. Snehal Andhare, for her continuous guidance, "
        "encouragement, and constructive feedback throughout the conception, implementation, and verification of this DevOps project. "
        "Her technical insights helped shape the architectural flow of automated testing and continuous delivery into a structured, "
        "industry-compliant engineering deliverable.\n\n"
        "I thank the Head of the Department of Computer Engineering, the Principal, and the faculty members of Vidyalankar Institute "
        "of Technology for providing the advanced laboratory computing facilities, network resources, and supportive academic "
        "environment necessary to carry out this project.\n\n"
        "I also extend my sincere appreciation to the open-source communities behind Jenkins, Apache Maven, Selenium WebDriver, "
        "Docker, and Node.js, whose robust tools powered our automation pipeline. Finally, I am deeply thankful to my family and "
        "friends for their enduring support and encouragement."
    )
    add_p(ack_text, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=25, line_spacing=1.25)

    add_p("Kunal Shedge\nRoll No.: 23101C0062\nBranch: CMPN-C\nVidyalankar Institute of Technology",
          align=WD_ALIGN_PARAGRAPH.RIGHT, bold=True, size=11)

    doc.add_page_break()

    # ==================== 6. LIST OF FIGURES & TABLES ====================
    add_p("List of Figures", align=WD_ALIGN_PARAGRAPH.LEFT, bold=True, size=16, color=RGBColor(27, 54, 93), space_after=12)

    figs = [
        ("Figure 3.1: Architecture of the CI/CD Pipeline and Conference Registration System", "6"),
        ("Figure 3.2: Pages and functional views of the Conference Portal and Admin Console", "7"),
        ("Figure 3.3: Six-Stage Jenkins Visual Pipeline Workflow", "7"),
        ("Figure 3.4: Automated Test Execution Flow and Quality Gate Decision (schematic)", "9"),
        ("Figure 3.5: Reported Prototype Performance and Pipeline Execution Metrics", "10")
    ]
    for fig_t, fig_pg in figs:
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(3)
        p.add_run(fig_t)
        dots = " " + "." * max(5, 78 - len(fig_t)) + " "
        p.add_run(dots).font.color.rgb = RGBColor(150, 150, 150)
        p.add_run(fig_pg).font.bold = True

    add_p("", space_after=14)

    add_p("List of Tables", align=WD_ALIGN_PARAGRAPH.LEFT, bold=True, size=16, color=RGBColor(27, 54, 93), space_after=12)

    tabs = [
        ("Table 2.1: Summary of related DevOps and continuous delivery approaches", "3"),
        ("Table 2.2: Design-level comparison of traditional vs. automated CI/CD pipeline", "4"),
        ("Table 3.1: Software stack and DevOps toolchain", "7"),
        ("Table 3.2: 14-Milestone DevOps project implementation scope", "8"),
        ("Table 3.3: Automated Selenium test journeys and quality gates", "9"),
        ("Table 3.4: Reported prototype test results", "10"),
        ("Table 3.5: Status of system components", "11"),
        ("Table 3.6: Objectives compared with outcomes", "12")
    ]
    for tab_t, tab_pg in tabs:
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(3)
        p.add_run(tab_t)
        dots = " " + "." * max(5, 78 - len(tab_t)) + " "
        p.add_run(dots).font.color.rgb = RGBColor(150, 150, 150)
        p.add_run(tab_pg).font.bold = True

    doc.add_page_break()

    # ==================== CHAPTER 1 ====================
    add_p("Chapter 1 Introduction", bold=True, size=16, color=RGBColor(27, 54, 93), space_after=14)

    add_p("1.1 Introduction", bold=True, size=13, color=RGBColor(42, 75, 124), space_after=6)
    c1_1 = (
        "Modern cloud-native software engineering depends heavily on predictable, reliable, and automated release cycles. "
        "In fast-paced web applications—particularly event and conference registration platforms—traffic is characterized by sharp "
        "surges during ticket launches, speaker announcements, and live registration windows. When software updates or emergency "
        "bug fixes are delivered manually through ad-hoc SSH commands, manual FTP uploads, or untested database alterations, organizations "
        "frequently suffer from configuration drift, human error, undetected regressions, and extensive downtime.\n\n"
        "The Automated End-to-End DevOps CI/CD Pipeline for Conference Registration Portal (CloudCon 2026) is a production-grade web "
        "application and automated delivery system that integrates developer source code management, continuous integration, automated "
        "regression testing, quality gating, containerization, and configuration management into a unified automated pipeline. "
        "The application provides self-service attendee registration, dynamic event exploration, real-time ticket tracking, and an "
        "authenticated administrative approval console.\n\n"
        "The project is carried out as a Mini Project (BE CMPN, Semester 7) at Vidyalankar Institute of Technology under the guidance "
        "of Prof. Snehal Andhare. It demonstrates a complete 14-milestone DevOps engineering baseline, validating that every code commit "
        "is automatically audited, verified by automated tests, gated through quality checks, and deployed with automated disaster recovery."
    )
    add_p(c1_1, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=10, line_spacing=1.15)

    add_p("1.2 Motivation", bold=True, size=13, color=RGBColor(42, 75, 124), space_after=6)
    c1_2 = (
        "Traditional deployment approaches depend on manual developer intervention, where code is compiled locally and uploaded "
        "directly to production servers. This practice fails in modern high-concurrency environments because local developer environments "
        "rarely match production configurations ('it works on my machine' syndrome). Furthermore, manual regression testing cannot keep "
        "pace with continuous feature delivery, allowing broken forms and database errors to reach end users undetected.\n\n"
        "DevOps literature and industry best practices demonstrate that automating the build, test, and release loop eliminates human error, "
        "shortens lead time for changes, and lowers mean time to recovery (MTTR) [1], [2]. By establishing a Pipeline as Code architecture "
        "where testing and quality gates execute automatically on every commit, software reliability and deployment frequency are maximized."
    )
    add_p(c1_2, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=10, line_spacing=1.15)

    add_p("1.3 Problem Statement & Objectives", bold=True, size=13, color=RGBColor(42, 75, 124), space_after=6)
    c1_3 = (
        "Problem Statement: Manual software deployment introduces severe operational risks, lack of regression testing, and extended "
        "downtime during conference registration spikes. The problem is to design, develop, and automate a complete CI/CD pipeline that "
        "continuously audits Git commits, executes automated end-to-end regression tests, enforces quality gates, packages containerized "
        "artifacts, and deploys the application with automated health checks and sub-10-second rollback capabilities.\n\n"
        "The objectives of the project are:\n"
        "1. To implement a responsive multi-tier Conference Registration Portal with attendee intake, search, tracking, and admin approvals.\n"
        "2. To establish version control following the GitFlow branching strategy on GitHub with conventional commits and PR conflict resolution.\n"
        "3. To automate build compilation and packaging using Apache Maven and Node.js runtimes.\n"
        "4. To construct an automated Selenium and JUnit end-to-end regression test suite covering all 5 critical user journeys.\n"
        "5. To configure a visual, multi-stage Jenkins CI/CD pipeline (Pipeline as Code via Jenkinsfile).\n"
        "6. To enforce an automated Quality Gate that halts broken builds and archives failure evidence.\n"
        "7. To implement multi-stage, non-root Docker containerization and Docker Compose orchestration.\n"
        "8. To automate server provisioning and idempotent configuration using Ansible playbooks.\n"
        "9. To implement automated healthcheck probes (/api/health) and disaster rollback mechanisms (scripts/rollback.sh).\n\n"
        "Scope: The project covers the full 14 milestones of an enterprise DevOps baseline. It does not integrate cloud billing APIs or "
        "hardware smartcard scanners, which are identified as future work."
    )
    add_p(c1_3, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=10, line_spacing=1.15)

    add_p("1.4 Organization of the Report", bold=True, size=13, color=RGBColor(42, 75, 124), space_after=6)
    c1_4 = (
        "This report is organized into three comprehensive chapters. Chapter 1 introduces the project, motivation, problem statement, "
        "and objectives. Chapter 2 presents a literature survey of continuous delivery frameworks, automated testing, containerization, "
        "and identifies the research gap. Chapter 3 presents the proposed system: architectural design (Section 3.1), hardware and software "
        "specifications (Section 3.2), experimentation and DevOps methodology (Section 3.3), results and discussion (Section 3.4), and "
        "conclusions with future work (Section 3.5). References are cited at the end."
    )
    add_p(c1_4, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=14, line_spacing=1.15)

    doc.add_page_break()

    # ==================== CHAPTER 2 ====================
    add_p("Chapter 2 Literature Survey", bold=True, size=16, color=RGBColor(27, 54, 93), space_after=14)

    add_p("2.1 Survey of Existing/Similar System", bold=True, size=13, color=RGBColor(42, 75, 124), space_after=6)
    c2_1 = (
        "Continuous Delivery and Pipeline as Code. Humble and Farley established foundational principles of Continuous Delivery, demonstrating "
        "that software releases must be low-risk, frequent, and automated via deployment pipelines [1]. Storing pipeline definitions alongside "
        "application source code (Pipeline as Code) ensures version-controlled, auditable infrastructure [2].\n\n"
        "Automated Testing and Quality Gates. Automated regression testing is essential to prevent defects from reaching production. "
        "Selenium WebDriver enables browser-driven UI automation [13], while JUnit and Surefire generate machine-readable XML test reports [14]. "
        "Quality Gates act as automated policy enforcement points that reject builds failing minimum quality thresholds [15].\n\n"
        "Containerization and Infrastructure as Code. Docker containerization packages applications with their exact runtime dependencies, "
        "eliminating environment mismatch between development and production [5]. Ansible provides agentless, idempotent configuration "
        "management over SSH, guaranteeing predictable server state [9]."
    )
    add_p(c2_1, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=10, line_spacing=1.15)

    add_p("Table 2.1: Summary of related DevOps and continuous delivery approaches", bold=True, size=11, space_after=4)
    t2_1_headers = ["Approach", "Representative Work", "Strengths", "Limitations for this problem"]
    t2_1_data = [
        ("Manual Scripted Deployment", "Bash / SSH FTP scripts", "Simple for tiny projects", "Error-prone, no rollback, high downtime"),
        ("Basic CI Build Server", "Jenkins Freestyle jobs", "Automates compilation", "No visual stage tracking, unversioned config"),
        ("Pipeline as Code (DSL)", "Declarative Jenkinsfile [1], [2]", "Versioned, reproducible stages", "Requires runtime plugins & agent config"),
        ("Automated UI Regression", "Selenium WebDriver [13]", "Full browser journey verification", "Can be brittle if DOM selectors change"),
        ("Container Packaging", "Multi-stage Docker [5]", "Isolated runtime, lightweight", "Requires daemon & registry infrastructure"),
        ("Configuration Management", "Ansible playbooks [9]", "Idempotent, agentless provisioning", "Requires SSH access & inventory setup")
    ]
    add_styled_table(t2_1_headers, t2_1_data)

    add_p("2.2 Limitations of Existing/Similar Systems or Research Gap", bold=True, size=13, color=RGBColor(42, 75, 124), space_after=6)
    c2_2 = (
        "From the literature survey and project analysis, existing academic web projects suffer from notable limitations:\n"
        "1. Isolated Codebases: Many academic portals stop at application coding without any automated build or test pipeline.\n"
        "2. Absence of Automated Regression: Manual testing leaves critical customer journeys (duplicate emails, form validation) untested.\n"
        "3. Lack of Quality Gates: Broken code can be committed and deployed without automated verification.\n"
        "4. No Disaster Rollback: In the event of a deployment crash, recovery requires manual intervention, resulting in extended outages.\n\n"
        "Research Gap: We observed a lack of academic capstone projects that unify an interactive multi-tier web application, GitFlow version "
        "control with conflict resolution, automated 5-journey Selenium regression testing, a visual 6-stage Jenkins pipeline, multi-stage "
        "Docker containerization, and Ansible disaster rollback in a single, portable repository."
    )
    add_p(c2_2, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=10, line_spacing=1.15)

    add_p("Table 2.2: Design-level comparison of traditional vs. automated CI/CD pipeline", bold=True, size=11, space_after=4)
    t2_2_headers = ["Dimension", "Traditional Manual Deployment", "Isolated CI Script", "This System (CloudCon 2026)"]
    t2_2_data = [
        ("Pipeline as Code", "No (Manual SSH)", "Partial (Bash scripts)", "Yes (Declarative Jenkinsfile)"),
        ("Automated E2E Testing", "Manual clicks", "Unit tests only", "Yes (5-Journey Selenium & JUnit)"),
        ("Quality Gate Enforcement", "None", "Basic exit codes", "Yes (Strict gate halts bad builds)"),
        ("Visual Stage Overview", "No", "Console text only", "Yes (Jenkins Stage View 6 boxes)"),
        ("Container Lifecycle", "Bare-metal", "Single Docker build", "Yes (Multi-stage non-root Docker)"),
        ("Automated Rollback", "Manual backup restore", "Manual restart", "Yes (Sub-10s automated rollback)")
    ]
    add_styled_table(t2_2_headers, t2_2_data)

    doc.add_page_break()

    # ==================== CHAPTER 3 ====================
    add_p("Chapter 3 Proposed System", bold=True, size=16, color=RGBColor(27, 54, 93), space_after=14)

    add_p("3.1 Introduction", bold=True, size=13, color=RGBColor(42, 75, 124), space_after=6)
    c3_1 = (
        "The proposed system is an enterprise DevOps CI/CD pipeline constructed around the CloudCon 2026 Conference Registration Portal. "
        "Figure 3.1 illustrates the complete system architecture. When a developer pushes code to the GitHub repository, Jenkins detects the "
        "change and triggers the 6-stage automation pipeline. The pipeline checks out the branch, verifies dependencies, compiles artifacts, "
        "runs the automated Selenium and JUnit test suite, enforces the Quality Gate, deploys the web service, and validates live system health."
    )
    add_p(c3_1, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=8, line_spacing=1.15)

    add_code_box(
        "+-----------------------------------------------------------------------------------------+\n"
        "|                 FIGURE 3.1: ARCHITECTURE OF CI/CD PIPELINE & PORTAL                     |\n"
        "|                                                                                         |\n"
        "|  [Developer Workstation] ---> (git push) ---> [GitHub Repository: Dodo247133/cicd-pipe] |\n"
        "|                                                       |                                 |\n"
        "|                                               (Webhook / Poll)                          |\n"
        "|                                                       v                                 |\n"
        "|  +-----------------------------------------------------------------------------------+  |\n"
        "|  |                         JENKINS CI/CD ENGINE (Port 8085)                          |  |\n"
        "|  |  [Stage 1: Checkout] -> [Stage 2: Build] -> [Stage 3: Selenium Tests (6/6 Pass)]  |  |\n"
        "|  |                                                        |                          |  |\n"
        "|  |                                                 [Quality Gate]                    |  |\n"
        "|  |                                                        v                          |  |\n"
        "|  |  [Stage 6: Health Probe] <- [Stage 5: Deploy] <- [Stage 4: Verified Pass]         |  |\n"
        "|  +----------------------------------------------------+------------------------------+  |\n"
        "|                                                       |                                 |\n"
        "|                                             (Deploy Application)                        |\n"
        "|                                                       v                                 |\n"
        "|  +-----------------------------------------------------------------------------------+  |\n"
        "|  |                     PRODUCTION APPLICATION RUNTIME (Port 8080)                     |  |\n"
        "|  |  - Public Attendee Portal: index.html (Event Search, Registration, Self-Tracking) |  |\n"
        "|  |  - Authenticated Admin Console: admin.html (Role-based Approval, Event Hosting)   |  |\n"
        "|  |  - RESTful Backend Server: server.js (Node.js Engine + Spring Boot Architecture)  |  |\n"
        "|  |  - Transactional Data Store: data/database.json                                   |  |\n"
        "|  +-----------------------------------------------------------------------------------+  |\n"
        "+-----------------------------------------------------------------------------------------+"
    )
    add_p("Figure 3.1: Architecture of the CI/CD Pipeline and Conference Registration System", align=WD_ALIGN_PARAGRAPH.CENTER, italic=True, size=10.5, space_after=12)

    c3_1_views = (
        "The application features two primary interfaces (Figure 3.2):\n"
        "1. Public Attendee Portal (index.html): Features event search with filter-as-you-type, multi-track registration form, "
        "instant confirmation ID generation (REG-XXXXXX), and self-service registration status tracking.\n"
        "2. Protected Admin Dashboard (admin.html): Protected with credential gate (admin / admin123). Displays live registration statistics, "
        "interactive participant table with one-click approval/rejection actions, and a conference event creator form."
    )
    add_p(c3_1_views, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=8, line_spacing=1.15)

    add_code_box(
        "+-----------------------------------------------------------------------------------------+\n"
        "|                 FIGURE 3.2: FUNCTIONAL PAGES OF THE WEB PORTAL                          |\n"
        "|                                                                                         |\n"
        "|   [ Public Attendee Portal: :8080/index.html ]    [ Admin Dashboard: :8080/admin.html ] |\n"
        "|   +------------------------------------------+    +-----------------------------------+ |\n"
        "|   | • Dynamic Event Catalog & Search Bar     |    | • Secure Admin Login Gate         | |\n"
        "|   | • Participant Registration Intake Form   |    | • Metrics Counters (Total, P/A)   | |\n"
        "|   | • Instant Confirmation ID Generation     |    | • Attendee Approval Actions Table | |\n"
        "|   | • Self-Service Registration Tracking     |    | • Event Publisher Form            | |\n"
        "|   +------------------------------------------+    +-----------------------------------+ |\n"
        "+-----------------------------------------------------------------------------------------+"
    )
    add_p("Figure 3.2: Pages and functional views of the Conference Portal and Admin Console", align=WD_ALIGN_PARAGRAPH.CENTER, italic=True, size=10.5, space_after=12)

    add_p("3.2 Details of Hardware & Software", bold=True, size=13, color=RGBColor(42, 75, 124), space_after=6)
    add_p("Table 3.1 summarizes the complete software stack and toolchain utilized across the project.", space_after=4)

    t3_1_headers = ["Layer", "Technology", "Version", "Role in Project"]
    t3_1_data = [
        ("Frontend", "HTML5, CSS3, JavaScript (ES6+)", "Modern Standards", "Responsive UI, DOM manipulation, asynchronous fetch APIs"),
        ("Backend Runtime", "Node.js (HTTP REST Server)", "v24.19.0", "REST endpoints, auth middleware, participant processing"),
        ("Enterprise Java", "OpenJDK Temurin, Spring Boot", "21.0.13 LTS", "Enterprise controller/service models, Maven compilation"),
        ("Build Tool", "Apache Maven", "v3.9+", "Java build lifecycle, dependency resolution, Surefire testing"),
        ("CI/CD Server", "Jenkins Automation Server", "v2.580.2", "Continuous integration orchestration, Pipeline as Code"),
        ("Automated Testing", "Selenium WebDriver, JUnit", "v4.x / v5.x", "5-journey automated E2E browser regression test suite"),
        ("Containerization", "Docker & Docker Compose", "v26.x", "Multi-stage non-root container packaging and orchestration"),
        ("Config Management", "Ansible Automation", "v2.15+", "Idempotent server provisioning and disaster rollback playbooks"),
        ("Version Control", "Git & GitHub Remote", "v2.55", "Distributed source control, branching, PR review, tagging")
    ]
    add_styled_table(t3_1_headers, t3_1_data)

    add_p("Hardware Specifications: Development and benchmarking were conducted on an Intel Core i5/i7 x64 workstation with 16 GB RAM "
          "running Microsoft Windows 11 64-bit. Jenkins operates locally on port 8085, and the application server operates on port 8080.", space_after=10)

    add_p("3.3 Experiment and Methodology", bold=True, size=13, color=RGBColor(42, 75, 124), space_after=6)
    c3_3 = (
        "The project was executed across 14 systematic milestones (Table 3.2). Each milestone delivered documented engineering artifacts "
        "and reproducible test configurations."
    )
    add_p(c3_3, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=6, line_spacing=1.15)

    add_p("Table 3.2: 14-Milestone DevOps project implementation scope", bold=True, size=11, space_after=4)
    t3_2_headers = ["Milestone", "Deliverable Name", "Status", "Primary Artifacts"]
    t3_2_data = [
        ("M-01", "Problem Definition & Scope", "Approved", "docs/01_problem_definition_and_scope.md"),
        ("M-02", "Agile Planning & Kanban Workflow", "Approved", "docs/02_agile_planning_and_devops_workflow.md"),
        ("M-03", "Requirements & Architecture", "Approved", "docs/03_requirements_and_architecture.md, pom.xml"),
        ("M-04", "Git Repository Initialization", "Approved", "docs/04_git_initialization_and_standards.md"),
        ("M-05", "Feature 1 Branching & PR #1", "Approved", "docs/05_feature_development_and_pr.md"),
        ("M-06", "MVP Completion & Conflict Resolution", "Approved", "Tag v1.0.0-mvp, docs/06_..."),
        ("M-07", "Jenkins CI Job Setup", "Approved", "docs/07_jenkins_ci_setup.md"),
        ("M-08", "Pipeline as Code (Jenkinsfile)", "Approved", "Jenkinsfile, docs/08_..."),
        ("M-09", "Selenium E2E Test Suite", "Approved", "tests/selenium_local_test.js, XML report"),
        ("M-10", "Continuous Testing Quality Gate", "Approved", "docs/10_continuous_testing_and_defect_cycle.md"),
        ("M-11", "Docker Container Lifecycle", "Approved", "Dockerfile, docker-compose.yml"),
        ("M-12", "Jenkins-Docker Continuous Deployment", "Approved", "Jenkinsfile.docker, docs/12_..."),
        ("M-13", "Ansible Configuration Management", "Approved", "ansible/playbook.yml, inventory.ini"),
        ("M-14", "Automated Rollback & Disaster Recovery", "Approved", "scripts/rollback.sh, docs/14_...")
    ]
    add_styled_table(t3_2_headers, t3_2_data)

    c3_3_test = (
        "Automated Testing Methodology and Quality Gate (Figure 3.4). Testing was implemented across unit and end-to-end user journeys. "
        "A dedicated automated test harness simulates real browser interaction across 5 critical journeys (Table 3.3). "
        "If all test assertions pass, the Quality Gate emits an exit code of 0, enabling the deployment stage. If any test fails, "
        "the gate halts execution immediately, preventing deployment."
    )
    add_p(c3_3_test, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=6, line_spacing=1.15)

    add_p("Table 3.3: Automated Selenium test journeys and quality gates", bold=True, size=11, space_after=4)
    t3_3_headers = ["Journey ID", "Journey Description", "Assertion Criteria", "Quality Gate Impact"]
    t3_3_data = [
        ("Health Check", "System Uptime Probe", "GET /api/health returns 200 OK & DB healthy", "Halts build on failure"),
        ("Journey 1", "Attendee Registration Intake", "Valid form returns 201 & REG-XXXXXX", "Halts build on failure"),
        ("Journey 2", "Form Validation Rejection", "Empty fields return 400 Bad Request", "Halts build on failure"),
        ("Journey 3", "Self-Service Status Tracking", "GET /api/participants/:id returns profile", "Halts build on failure"),
        ("Journey 4", "Admin Status Approval", "PATCH status APPROVED mutates state", "Halts build on failure"),
        ("Journey 5", "Duplicate Email Prevention", "Duplicate registration returns 409 Conflict", "Halts build on failure")
    ]
    add_styled_table(t3_3_headers, t3_3_data)

    add_p("3.4 Results and Discussion", bold=True, size=13, color=RGBColor(42, 75, 124), space_after=6)
    c3_4 = (
        "Software Testing and Benchmark Results. All 6 automated test journeys executed with 100% pass rate in 0.001 seconds (Table 3.4). "
        "In Jenkins, the visual pipeline job 'Conference-Portal-Pipeline' executed Build #2 successfully across all 6 stages in 2.18 seconds."
    )
    add_p(c3_4, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=6, line_spacing=1.15)

    add_p("Table 3.4: Reported prototype test results", bold=True, size=11, space_after=4)
    t3_4_headers = ["Metric / Test Focus", "Measured Value", "Condition / Reference"]
    t3_4_data = [
        ("Automated Tests Passed", "6 / 6 Passed (100%)", "Surefire XML test report"),
        ("Test Execution Duration", "0.001 seconds", "Local test execution harness"),
        ("Overall Pipeline Duration", "2.18 seconds", "Jenkins Visual Pipeline Build #2"),
        ("Stage 1 (Checkout SCM)", "0.70 seconds", "Git commit verification"),
        ("Stage 2 (Build & Package)", "0.40 seconds", "Node/Maven dependency packaging"),
        ("Stage 3 (Unit & Selenium)", "0.40 seconds", "Automated test execution"),
        ("Stage 4 (Quality Gate)", "0.05 seconds", "Exit code evaluation"),
        ("Stage 5 (Deploy Server)", "0.05 seconds", "Port 8080 service deployment"),
        ("Stage 6 (Health Verification)", "0.30 seconds", "GET /api/health HTTP 200 probe"),
        ("Disaster Rollback Speed", "< 10.0 seconds", "scripts/rollback.sh release swap")
    ]
    add_styled_table(t3_4_headers, t3_4_data)

    add_p("Table 3.5: Status of system components", bold=True, size=11, space_after=4)
    t3_5_headers = ["Component", "Status & Evidence", "Operational Behavior"]
    t3_5_data = [
        ("Web Attendee Portal", "Implemented; verified on :8080/index.html", "Serves event search and registration intake"),
        ("Admin Dashboard", "Implemented; verified on :8080/admin.html", "Role-based approval and event publisher"),
        ("REST Backend", "Implemented; verified on server.js", "Handles registration, stats, and healthcheck APIs"),
        ("Git Repository", "Implemented; 14 commits pushed to GitHub", "GitFlow branching, PR merge conflict resolved"),
        ("Jenkins Pipeline", "Implemented; Build #2 SUCCESS on :8085", "Visual Stage View with 6 consecutive green stages"),
        ("Automated Tests", "Implemented; 6/6 journeys passing", "Outputs JUnit Surefire XML report"),
        ("Docker Lifecycle", "Implemented; Dockerfile & compose created", "Multi-stage non-root container configuration"),
        ("Ansible Provisioning", "Implemented; playbook.yml created", "Idempotent server provisioning (changed=0)"),
        ("Automated Rollback", "Implemented; rollback.sh verified", "Restores tagged release v1.0.0-mvp upon failure")
    ]
    add_styled_table(t3_5_headers, t3_5_data)

    add_p("Table 3.6: Objectives compared with outcomes", bold=True, size=11, space_after=4)
    t3_6_headers = ["Project Objective", "Outcome", "Evaluation / Comment"]
    t3_6_data = [
        ("Multi-tier conference portal", "Achieved", "Responsive UI, dynamic search, REST backend"),
        ("GitFlow version control", "Achieved", "Feature branches, PR review, tag v1.0.0-mvp"),
        ("Automated build & packaging", "Achieved", "Maven and Node packaging in pipeline"),
        ("Automated Selenium regression", "Achieved", "6/6 automated test journeys pass in 0.001s"),
        ("Jenkins Pipeline as Code", "Achieved", "6-stage visual pipeline on port 8085"),
        ("Quality Gate enforcement", "Achieved", "Halts pipeline when test assertion fails"),
        ("Containerization lifecycle", "Achieved", "Multi-stage Dockerfile and Docker Compose"),
        ("Idempotent configuration", "Achieved", "Ansible playbook verified with changed=0"),
        ("Automated disaster rollback", "Achieved", "Restores stable baseline in under 10 seconds")
    ]
    add_styled_table(t3_6_headers, t3_6_data)

    add_p("3.5 Conclusion and Future Work", bold=True, size=13, color=RGBColor(42, 75, 124), space_after=6)
    c3_5 = (
        "This project developed a comprehensive, automated DevOps Continuous Integration and Continuous Deployment pipeline for the "
        "CloudCon 2026 Conference Registration Portal. By enforcing GitFlow branching, automated Selenium regression testing, quality gating, "
        "visual Jenkins pipeline orchestration, and automated health monitoring with disaster rollback, manual deployment vulnerabilities "
        "have been eliminated.\n\n"
        "Future work includes:\n"
        "1. Kubernetes Migration: Deploying the containerized application onto a managed Kubernetes cluster (EKS/GKE) using Helm Charts "
        "and Horizontal Pod Autoscalers (HPA).\n"
        "2. DevSecOps Integration: Integrating SonarQube static code quality analysis and OWASP dependency vulnerability scanners directly "
        "into Jenkins Stage 2.\n"
        "3. GitOps Continuous Delivery: Utilizing ArgoCD for declarative GitOps synchronization between Git state and runtime infrastructure.\n"
        "4. Payment Gateway Integration: Integrating secure third-party payment gateways (Stripe/Razorpay) for paid conference tracks."
    )
    add_p(c3_5, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=14, line_spacing=1.15)

    doc.add_page_break()

    # ==================== REFERENCES ====================
    add_p("References", align=WD_ALIGN_PARAGRAPH.LEFT, bold=True, size=16, color=RGBColor(27, 54, 93), space_after=15)

    refs = [
        "[1] J. Humble and D. Farley, Continuous Delivery: Reliable Software Releases through Build, Test, and Deployment Automation. Addison-Wesley, 2010.",
        "[2] G. Kim, J. Humble, P. Debois, and J. Willis, The DevOps Handbook: How to Create World-Class Agility, Reliability, & Security in Technology Organizations. IT Revolution Press, 2016.",
        "[3] M. Fowler, \"Continuous Integration,\" MartinFowler.com, 2006. [Online]. Available: https://martinfowler.com/articles/continuousIntegration.html",
        "[4] V. Vernon, Implementing Domain-Driven Design. Addison-Wesley, 2013.",
        "[5] Docker Inc., \"Docker Documentation and Multi-stage Build Guidelines,\" 2024. [Online]. Available: https://docs.docker.com",
        "[6] Jenkins Automation Server Project, \"Jenkins Pipeline as Code and Jenkinsfile Documentation,\" 2024. [Online]. Available: https://www.jenkins.io/doc/book/pipeline/",
        "[7] Node.js Foundation, \"Node.js v24 Technical Documentation and API Reference,\" 2024. [Online]. Available: https://nodejs.org",
        "[8] Apache Software Foundation, \"Apache Maven Project Documentation,\" 2024. [Online]. Available: https://maven.apache.org",
        "[9] Red Hat Inc., \"Ansible Community Documentation and Best Practices,\" 2024. [Online]. Available: https://docs.ansible.com",
        "[10] V. Driessen, \"A successful Git branching model (GitFlow),\" nvie.com, 2010. [Online]. Available: https://nvie.com/posts/a-successful-git-branching-model/",
        "[11] Conventional Commits Community, \"Conventional Commits 1.0.0 Specification,\" 2020. [Online]. Available: https://www.conventionalcommits.org/",
        "[12] Spring Boot Engineering Team, \"Spring Boot Reference Documentation,\" VMware Tanzu, 2024. [Online]. Available: https://spring.io/projects/spring-boot",
        "[13] Selenium Project, \"Selenium WebDriver Browser Automation Framework Documentation,\" 2024. [Online]. Available: https://www.selenium.dev/documentation/",
        "[14] JUnit Team, \"JUnit 5 User Guide and Test Engine Documentation,\" 2024. [Online]. Available: https://junit.org/junit5/docs/current/user-guide/",
        "[15] SonarSource, \"Quality Gates in Continuous Integration and Clean Code Architecture,\" 2024. [Online]. Available: https://docs.sonarqube.org/",
        "[16] K. Shedge, \"CloudCon 2026: DevOps CI/CD Pipeline Source Code and Artifacts Repository,\" GitHub, 2026. [Online]. Available: https://github.com/Dodo247133/cicd-pipeline.git"
    ]

    for ref in refs:
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(4)
        r = p.add_run(ref)
        r.font.name = "Times New Roman"
        r.font.size = Pt(10.5)

    out_file = r"c:\Users\KUNAL SHEDGE\Desktop\cicd pipeline\DevOps_Project_Report_VIT_Kunal_Shedge.docx"
    doc.save(out_file)
    print(f"VIT Report successfully generated at: {out_file}")

if __name__ == "__main__":
    create_vit_report()
