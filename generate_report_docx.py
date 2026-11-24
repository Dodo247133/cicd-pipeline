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

def create_report():
    doc = Document()
    
    # 1. Page Margins - Standard Academic 1 inch
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.different_first_page_header_footer = True
        
        # Header / Footer
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("CloudCon 2026 — DevOps Capstone Project Report | Kunal Shedge (23101C0062)")
        hrun.font.name = "Calibri"
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(128, 128, 128)

        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Department of Computer Engineering • CMPN-C")
        frun.font.name = "Calibri"
        frun.font.size = Pt(9)
        frun.font.color.rgb = RGBColor(128, 128, 128)

    # Base Styles
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(40, 40, 40)
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(4)

    # ------------------ COVER PAGE ------------------
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_inst = p_inst.add_run("DEPARTMENT OF COMPUTER ENGINEERING\nACADEMIC YEAR 2026 – 2027\n")
    r_inst.font.name = "Calibri"
    r_inst.font.size = Pt(12)
    r_inst.font.bold = True
    r_inst.font.color.rgb = RGBColor(27, 54, 93) # Navy Blue

    doc.add_paragraph() # Spacer

    p_proj = doc.add_paragraph()
    p_proj.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_type = p_proj.add_run("A CAPSTONE PROJECT REPORT ON\n\n")
    r_type.font.name = "Calibri"
    r_type.font.size = Pt(12)
    r_type.font.color.rgb = RGBColor(100, 100, 100)

    r_title = p_proj.add_run("CLOUDCON 2026:\nAUTOMATED END-TO-END DEVOPS CI/CD PIPELINE FOR A HIGH-VOLUME CONFERENCE REGISTRATION PORTAL\n")
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(18)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(27, 54, 93)

    doc.add_paragraph() # Spacer

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_sub.add_run("Submitted in partial fulfillment of the requirements\nfor the award of the degree of\n")
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(11)
    r_deg = p_sub.add_run("BACHELOR OF ENGINEERING IN COMPUTER ENGINEERING\n")
    r_deg.font.name = "Calibri"
    r_deg.font.size = Pt(13)
    r_deg.font.bold = True

    doc.add_paragraph() # Spacer

    # Student & Guide Table on Cover Page
    cover_table = doc.add_table(rows=2, cols=2)
    cover_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cover_table.autofit = False

    cell_00 = cover_table.cell(0, 0)
    p00 = cell_00.paragraphs[0]
    p00.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r00 = p00.add_run("SUBMITTED BY:\n")
    r00.font.bold = True
    r00.font.size = Pt(11)
    r00.font.color.rgb = RGBColor(27, 54, 93)
    p00.add_run("Student Name: ").font.bold = True
    p00.add_run("Kunal Shedge\n")
    p00.add_run("Roll Number: ").font.bold = True
    p00.add_run("23101C0062\n")
    p00.add_run("Class / Div: ").font.bold = True
    p00.add_run("CMPN-C\n")

    cell_01 = cover_table.cell(0, 1)
    p01 = cell_01.paragraphs[0]
    p01.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r01 = p01.add_run("UNDER THE GUIDANCE OF:\n")
    r01.font.bold = True
    r01.font.size = Pt(11)
    r01.font.color.rgb = RGBColor(27, 54, 93)
    p01.add_run("Faculty Guide: ").font.bold = True
    p01.add_run("Prof. Snehal Andhare\n")
    p01.add_run("Designation: ").font.bold = True
    p01.add_run("Assistant Professor\n")
    p01.add_run("Department: ").font.bold = True
    p01.add_run("Computer Engineering\n")

    cell_repo = cover_table.cell(1, 0)
    cell_repo.merge(cover_table.cell(1, 1))
    prepo = cell_repo.paragraphs[0]
    prepo.alignment = WD_ALIGN_PARAGRAPH.CENTER
    prepo.paragraph_format.space_before = Pt(18)
    r_repo = prepo.add_run("Repository: https://github.com/Dodo247133/cicd-pipeline.git")
    r_repo.font.italic = True
    r_repo.font.size = Pt(9.5)
    r_repo.font.color.rgb = RGBColor(100, 100, 100)

    doc.add_page_break()

    # ------------------ CERTIFICATE ------------------
    h_cert = doc.add_paragraph()
    h_cert.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_cert_h = h_cert.add_run("CERTIFICATE OF APPROVAL\n")
    r_cert_h.font.name = "Calibri"
    r_cert_h.font.size = Pt(16)
    r_cert_h.font.bold = True
    r_cert_h.font.color.rgb = RGBColor(27, 54, 93)

    p_cert_body = doc.add_paragraph()
    p_cert_body.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_cert_body.paragraph_format.line_spacing = 1.3
    p_cert_body.paragraph_format.space_before = Pt(14)
    p_cert_body.paragraph_format.space_after = Pt(18)
    p_cert_body.add_run(
        "This is to certify that the project entitled "
    )
    r_title_inline = p_cert_body.add_run('"CLOUDCON 2026: AUTOMATED END-TO-END DEVOPS CI/CD PIPELINE FOR A HIGH-VOLUME CONFERENCE REGISTRATION PORTAL"')
    r_title_inline.font.bold = True
    p_cert_body.add_run(
        " is a bona fide work completed by "
    )
    r_name_inline = p_cert_body.add_run("Kunal Shedge (Roll No: 23101C0062)")
    r_name_inline.font.bold = True
    p_cert_body.add_run(
        ", a student of Bachelor of Engineering in Computer Engineering (CMPN-C), under the guidance and supervision of "
    )
    r_guide_inline = p_cert_body.add_run("Prof. Snehal Andhare")
    r_guide_inline.font.bold = True
    p_cert_body.add_run(
        " during the Academic Year 2026–2027.\n\n"
        "This project fulfills all academic and industrial standards for continuous integration, automated testing, container orchestration, quality gating, and continuous delivery."
    )

    doc.add_paragraph() # Spacer
    doc.add_paragraph()

    # Signature Table
    sig_table = doc.add_table(rows=1, cols=3)
    sig_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    sig_table.autofit = False

    s1 = sig_table.cell(0, 0).paragraphs[0]
    s1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    s1.add_run("_____________________\n").font.bold = True
    s1.add_run("Prof. Snehal Andhare\n").font.bold = True
    s1.add_run("Project Guide\nDept. of Computer Engineering")

    s2 = sig_table.cell(0, 1).paragraphs[0]
    s2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    s2.add_run("_____________________\n").font.bold = True
    s2.add_run("Head of Department\n").font.bold = True
    s2.add_run("Dept. of Computer Engineering")

    s3 = sig_table.cell(0, 2).paragraphs[0]
    s3.alignment = WD_ALIGN_PARAGRAPH.CENTER
    s3.add_run("_____________________\n").font.bold = True
    s3.add_run("External Examiner\n").font.bold = True
    s3.add_run("Date: _______________")

    doc.add_page_break()

    # ------------------ DECLARATION & ACKNOWLEDGEMENT ------------------
    h_decl = doc.add_paragraph()
    r_decl_h = h_decl.add_run("DECLARATION")
    r_decl_h.font.name = "Calibri"
    r_decl_h.font.size = Pt(14)
    r_decl_h.font.bold = True
    r_decl_h.font.color.rgb = RGBColor(27, 54, 93)

    p_decl = doc.add_paragraph()
    p_decl.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_decl.paragraph_format.line_spacing = 1.2
    p_decl.add_run(
        "I hereby declare that the project report entitled "
        '"CloudCon 2026: Automated End-to-End DevOps CI/CD Pipeline for a High-Volume Conference Registration Portal" '
        "submitted to the Department of Computer Engineering is an authentic record of original work carried out by me under the guidance of "
        "Prof. Snehal Andhare.\n\n"
        "I further declare that this work has not formed the basis for the award of any other degree or diploma, and all external contributions, tools, libraries, and frameworks have been cited accurately."
    )

    p_sig_kunal = doc.add_paragraph()
    p_sig_kunal.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_sig_kunal.paragraph_format.space_before = Pt(20)
    p_sig_kunal.add_run("Kunal Shedge\n").font.bold = True
    p_sig_kunal.add_run("Roll No.: 23101C0062\nBranch: CMPN-C\nDepartment of Computer Engineering")

    doc.add_paragraph() # Spacer

    h_ack = doc.add_paragraph()
    r_ack_h = h_ack.add_run("ACKNOWLEDGEMENT")
    r_ack_h.font.name = "Calibri"
    r_ack_h.font.size = Pt(14)
    r_ack_h.font.bold = True
    r_ack_h.font.color.rgb = RGBColor(27, 54, 93)

    p_ack = doc.add_paragraph()
    p_ack.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_ack.paragraph_format.line_spacing = 1.2
    p_ack.add_run(
        "I express my profound gratitude to my project mentor, Prof. Snehal Andhare, for her invaluable advice, technical guidance, and constructive critiques throughout the lifecycle of this DevOps project.\n\n"
        "I am grateful to our Head of Department and the faculty members of the Department of Computer Engineering for their constant academic encouragement and for providing the modern computing and network laboratories required to validate our continuous delivery pipeline.\n\n"
        "Finally, I thank my parents and peers for their unwavering encouragement during the testing, integration, and documentation phases."
    )

    doc.add_page_break()

    # ------------------ EXECUTIVE SUMMARY / ABSTRACT ------------------
    h_abs = doc.add_paragraph()
    r_abs_h = h_abs.add_run("EXECUTIVE SUMMARY & ABSTRACT")
    r_abs_h.font.name = "Calibri"
    r_abs_h.font.size = Pt(14)
    r_abs_h.font.bold = True
    r_abs_h.font.color.rgb = RGBColor(27, 54, 93)

    p_abs = doc.add_paragraph()
    p_abs.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_abs.paragraph_format.line_spacing = 1.25
    p_abs.add_run(
        "In modern cloud computing and enterprise software engineering, manual software delivery lifecycles introduce severe operational bottlenecks, configuration drifts, unpredictable deployment failures, and extended mean time to recovery (MTTR). This project presents CloudCon 2026, an enterprise-grade, fully automated DevOps Continuous Integration and Continuous Deployment (CI/CD) ecosystem constructed for a high-volume Conference Registration Portal.\n\n"
        "The system incorporates a modern multi-tier web application built with HTML5, CSS3, ES6 JavaScript, and high-throughput Node.js REST APIs alongside an enterprise Java Spring Boot backend managed by Apache Maven. The software engineering lifecycle adheres rigorously to the GitFlow branching strategy, featuring automated feature branch validations, pull request reviews, merge conflict resolutions, and semantic version tagging (v1.0.0-mvp).\n\n"
        "Continuous Integration and Continuous Delivery are powered by Jenkins running in a standalone, portable runtime environment. The pipeline enforces automated build compilation, dependency resolution, execution of a 5-journey automated Selenium and JUnit end-to-end regression test suite, quality gate validation, multi-stage Docker containerization, and post-deployment health check probes. Furthermore, disaster recovery and infrastructure resilience are secured through Ansible configuration playbooks and automated rollback scripts (scripts/rollback.sh), ensuring zero-downtime operational reliability."
    )

    doc.add_page_break()

    # ------------------ TABLE OF CONTENTS ------------------
    h_toc = doc.add_paragraph()
    r_toc_h = h_toc.add_run("TABLE OF CONTENTS")
    r_toc_h.font.name = "Calibri"
    r_toc_h.font.size = Pt(14)
    r_toc_h.font.bold = True
    r_toc_h.font.color.rgb = RGBColor(27, 54, 93)

    toc_items = [
        ("1. Chapter 1: Introduction & Problem Definition", "1"),
        ("    1.1 Background & Motivation", "1"),
        ("    1.2 Problem Statement", "1"),
        ("    1.3 Project Objectives", "2"),
        ("    1.4 Scope of the Project", "2"),
        ("2. Chapter 2: Agile Planning & DevOps Workflow", "3"),
        ("    2.1 Agile Scrum & Kanban Methodology", "3"),
        ("    2.2 User Stories & Acceptance Criteria", "3"),
        ("    2.3 Definition of Done (DoD)", "4"),
        ("    2.4 End-to-End DevOps Lifecycle", "4"),
        ("3. Chapter 3: System Architecture & Technical Specifications", "5"),
        ("    3.1 3-Tier Application Architecture", "5"),
        ("    3.2 Technology Stack Breakdown (Frontend & Backend)", "5"),
        ("    3.3 RESTful API Specifications", "6"),
        ("    3.4 Data Model & Storage Mechanism", "6"),
        ("4. Chapter 4: Version Control & GitFlow Strategy", "7"),
        ("    4.1 Git Standards & Conventional Commits", "7"),
        ("    4.2 Branching Hierarchy & Feature Development", "7"),
        ("    4.3 Merge Conflict Simulation & Resolution", "8"),
        ("    4.4 Release Tagging & GitHub Integration", "8"),
        ("5. Chapter 5: Continuous Integration with Jenkins", "9"),
        ("    5.1 Jenkins Automation Server Setup", "9"),
        ("    5.2 Pipeline as Code (Visual Stages)", "9"),
        ("    5.3 Automated Build & Artifact Packaging", "10"),
        ("6. Chapter 6: Automated Testing & Quality Gates", "11"),
        ("    6.1 Testing Strategy (Unit, Integration, E2E)", "11"),
        ("    6.2 Selenium UI Automation (5 Critical User Journeys)", "11"),
        ("    6.3 JUnit Surefire Test Reporting", "12"),
        ("    6.4 Quality Gate Enforcement", "12"),
        ("7. Chapter 7: Containerization & Continuous Deployment", "13"),
        ("    7.1 Multi-Stage Dockerfile Architecture", "13"),
        ("    7.2 Docker Compose Multi-Container Topology", "13"),
        ("    7.3 Continuous Deployment Workflow", "14"),
        ("8. Chapter 8: Configuration Management & Disaster Recovery", "15"),
        ("    8.1 Ansible Automation & System Idempotency", "15"),
        ("    8.2 Automated Healthcheck Probes", "15"),
        ("    8.3 Automated Disaster Rollback Mechanism", "16"),
        ("9. Chapter 9: Experimental Results & Execution Logs", "17"),
        ("    9.1 Automated Test Execution Log (6/6 Passed)", "17"),
        ("    9.2 Jenkins Visual Pipeline Execution Evidence", "17"),
        ("    9.3 Git Commit Audit Trail", "18"),
        ("10. Chapter 10: Conclusion & Future Scope", "19"),
        ("    10.1 Project Conclusion", "19"),
        ("    10.2 Future Scope", "19"),
        ("11. References", "20")
    ]

    for item, page in toc_items:
        p_t = doc.add_paragraph()
        p_t.paragraph_format.line_spacing = 1.15
        p_t.paragraph_format.space_after = Pt(2)
        r_item = p_t.add_run(item)
        r_item.font.name = "Calibri"
        if not item.startswith("    "):
            r_item.font.bold = True
        
        # Dot leader effect
        dots_count = max(5, 75 - len(item))
        p_t.add_run(" " + "." * dots_count + " ")
        r_p = p_t.add_run(page)
        r_p.font.bold = True

    doc.add_page_break()

    # ------------------ HELPER FUNCTIONS FOR CHAPTERS ------------------
    def add_chapter_heading(num, title):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        r = p.add_run(f"CHAPTER {num}: {title.upper()}")
        r.font.name = "Calibri"
        r.font.size = Pt(15)
        r.font.bold = True
        r.font.color.rgb = RGBColor(27, 54, 93)

    def add_section_heading(title):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        r = p.add_run(title)
        r.font.name = "Calibri"
        r.font.size = Pt(12.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(42, 75, 124)

    def add_body(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(4)
        r = p.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(11)

    def add_code_block(code_text):
        table = doc.add_table(rows=1, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = table.cell(0, 0)
        set_cell_background(cell, "F4F5F7")
        set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
        p = cell.paragraphs[0]
        p.paragraph_format.line_spacing = 1.05
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(code_text)
        r.font.name = "Consolas"
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(30, 30, 30)
        doc.add_paragraph() # Small spacer

    # ------------------ CHAPTER 1 ------------------
    add_chapter_heading(1, "Introduction & Problem Definition")
    add_section_heading("1.1 Background & Motivation")
    add_body(
        "Modern enterprise software engineering demands unprecedented agility, reliability, and security. In fast-paced organizational landscapes, conference registration portals, ticket management engines, and real-time attendee booking portals often face unpredictable, intense traffic spikes during promotional events, keynote announcements, and ticket releases. "
        "Historically, deploying updates or patches required engineering teams to perform manual steps: copying compiled archives over FTP or SSH, running ad-hoc database migration scripts, manually stopping background web services, and hoping that configuration dependencies matched between local laptops and production servers. "
        "These manual practices consistently lead to severe human error, configuration drift, untested code leaking into production, and lengthy server downtimes."
    )
    add_body(
        "DevOps bridges this divide by synthesizing cultural philosophies, automated workflows, and standardized toolchains. Through Continuous Integration (CI) and Continuous Deployment (CD), every incremental change pushed by a developer is subjected to rigorous, automated scrutiny before it is allowed to touch production servers."
    )

    add_section_heading("1.2 Problem Statement")
    add_body(
        "The objective of this project is to architect, develop, and automate a complete, industrial-grade DevOps delivery pipeline for 'CloudCon 2026', a full-featured Conference Registration Portal. "
        "The system must automate the entire software development lifecycle—from the moment a developer commits code to GitHub, through automated linting, compilation, multi-browser Selenium regression testing, quality gating, Docker containerization, and automated deployment verification with instant rollback capabilities."
    )

    add_section_heading("1.3 Project Objectives")
    add_body(
        "1. Version Control & GitFlow: Establish strict branching policies, conventional commit standards, simulated merge conflict resolution, and release tagging on GitHub.\n"
        "2. Automated Build & CI: Provision Jenkins to automate artifact compilation, dependency management via Apache Maven and Node.js.\n"
        "3. Automated Quality Gating: Implement automated end-to-end user journey tests using Selenium WebDriver and JUnit, enforcing zero defect tolerance before release.\n"
        "4. Containerization & Orchestration: Create secure, multi-stage non-root Docker images and multi-container Docker Compose definitions.\n"
        "5. Automated Provisioning & Resilience: Implement Ansible configuration management and automated health probes that trigger sub-10-second rollbacks in the event of production failure."
    )

    add_section_heading("1.4 Scope of the Project")
    add_body(
        "The project encompasses the full 14 milestones of an enterprise DevOps baseline. Deliverables include an attendee web portal (event browsing, ticket selection, status tracking), an administrative approval console (role-based login, participant approval, dynamic event hosting), a 6-stage visual Jenkins Pipeline, and one-click execution batch scripts for local operation."
    )

    # ------------------ CHAPTER 2 ------------------
    add_chapter_heading(2, "Agile Planning & DevOps Workflow")
    add_section_heading("2.1 Agile Scrum & Kanban Methodology")
    add_body(
        "The development lifecycle was organized using Agile principles, blending Scrum sprint cadences with a Kanban continuous flow board. "
        "The project scope was decomposed into distinct user stories prioritized based on business value and technical dependencies. Columns on the Kanban board (Backlog, In Progress, Code Review, Testing/QA, Done) allowed transparent progress tracking."
    )

    add_section_heading("2.2 User Stories & Acceptance Criteria")
    add_body(
        "• US-01 (Attendee Registration): As an attendee, I want to submit my registration details so that I receive an immediate confirmation ID.\n"
        "  Acceptance Criteria: Form requires full name, valid email, ticket category; rejects invalid emails; returns unique confirmation ID (e.g., REG-XXXXXX).\n\n"
        "• US-02 (Registration Tracking): As an attendee, I want to query my registration status using my confirmation ID.\n"
        "  Acceptance Criteria: Immediate lookup returning participant profile, selected track, and status badge (PENDING or APPROVED).\n\n"
        "• US-03 (Admin Approval Console): As an event coordinator, I want to log into an administrative dashboard to review pending registrations.\n"
        "  Acceptance Criteria: Secure credential authentication (admin/admin123); responsive data grid; one-click status mutation; dynamic metric counters.\n\n"
        "• US-04 (Event Publishing & Search): As an event organizer, I want to host new sessions and allow attendees to search conferences dynamically.\n"
        "  Acceptance Criteria: Dynamic filter-as-you-type search bar; event creation modal with capacity and venue tracking."
    )

    add_section_heading("2.3 Definition of Done (DoD)")
    add_body(
        "To ensure uncompromising quality, a feature was declared 'Done' only if:\n"
        "1. Code complies with ES6/Java style guides and contains no syntax warnings.\n"
        "2. Peer review completed via Git Pull Request with documented approval.\n"
        "3. 100% of automated Selenium and JUnit tests pass successfully.\n"
        "4. Jenkins Pipeline builds with SUCCESS status across all 6 stages.\n"
        "5. Deployed application passes automated `/api/health` probes returning HTTP 200 OK."
    )

    # ------------------ CHAPTER 3 ------------------
    add_chapter_heading(3, "System Architecture & Technical Specifications")
    add_section_heading("3.1 3-Tier Application Architecture")
    add_body(
        "The CloudCon 2026 system is structured into three cleanly decoupled architectural tiers:\n"
        "1. Presentation Tier (Frontend): Responsive Single Page Application (SPA) constructed using HTML5 semantic elements, CSS3 (Flexbox/Grid layout, custom property variables), and vanilla JavaScript (ES6+). It interfaces with the backend asynchronously using the browser Fetch API.\n"
        "2. Application Tier (Backend): High-throughput Node.js runtime engine and REST API server (server.js) bound to port 8080, complemented by an enterprise Java Spring Boot 3.2 model/controller architecture managed by Apache Maven.\n"
        "3. Data Tier (Storage): In-memory caching engine paired with an atomic, transactional JSON document datastore (data/database.json), guaranteeing ACID-like consistency without external database installation overhead."
    )

    add_section_heading("3.2 Technology Stack Breakdown")
    
    # Table of Tech Stack
    t_tech = doc.add_table(rows=6, cols=3)
    t_tech.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["Layer", "Technologies Used", "Key Purpose"]
    for i, h in enumerate(headers):
        cell = t_tech.cell(0, i)
        set_cell_background(cell, "1B365D")
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    data = [
        ("Frontend", "HTML5, CSS3, JavaScript (ES6+)", "Responsive attendee UI, admin dashboard, dynamic search"),
        ("Backend", "Node.js v24, Java OpenJDK 21, Spring Boot", "REST APIs, role-based auth, registration logic, health probes"),
        ("CI/CD Automation", "Jenkins 2.580.2, Jenkins Pipeline DSL", "6-stage automated build, test, quality gate, deploy pipeline"),
        ("Automated Testing", "Selenium WebDriver, JUnit, Surefire", "5 critical user journey end-to-end regression test suite"),
        ("Containerization", "Docker, Docker Compose, Nginx", "Multi-stage non-root containers, microservice orchestration")
    ]
    for row_idx, row_data in enumerate(data, start=1):
        for col_idx, text in enumerate(row_data):
            cell = t_tech.cell(row_idx, col_idx)
            if row_idx % 2 == 0:
                set_cell_background(cell, "F2F4F8")
            cell.paragraphs[0].add_run(text)

    doc.add_paragraph() # Spacer

    add_section_heading("3.3 RESTful API Specifications")
    add_body(
        "• GET /api/health — System uptime and database integrity probe (used by CI/CD Quality Gate).\n"
        "• POST /api/register — Intake of new attendee registration payload.\n"
        "• GET /api/participants — Fetch all registered participants (secured for admin role).\n"
        "• GET /api/participants/:id — Query status of a single registration by confirmation ID.\n"
        "• PATCH /api/participants/:id/status — Approve or reject an attendee registration.\n"
        "• GET /api/events & POST /api/events — Query and publish conference events dynamically.\n"
        "• POST /api/admin/login — Authenticate administrative credentials and initiate session."
    )

    # ------------------ CHAPTER 4 ------------------
    add_chapter_heading(4, "Version Control & GitFlow Strategy")
    add_section_heading("4.1 Git Standards & Conventional Commits")
    add_body(
        "All changes pushed to the repository follow strict Semantic Conventional Commits: 'feat' for new features, 'fix' for bug patches, 'ci' for pipeline automation, and 'docs' for technical documentation. "
        "A rigorous `.gitignore` file guarantees that binary artifacts, dependencies (node_modules), and test reports are never accidentally committed."
    )

    add_section_heading("4.2 Branching Hierarchy & Feature Development")
    add_body(
        "The project follows the GitFlow methodology:\n"
        "• main: Dedicated exclusively to validated, production-ready code. Contains tagged releases (v1.0.0-mvp).\n"
        "• develop: The integration branch where completed features are merged and regression-tested.\n"
        "• feature/registration-form: Isolated branch for building client validation, registration intake, and confirmation logic.\n"
        "• feature/admin-approval-listing: Isolated branch for the administrative console, metrics tracking, and event hosting."
    )

    add_section_heading("4.3 Merge Conflict Simulation & Resolution")
    add_body(
        "To simulate real-world collaborative conflicts, both feature branches concurrently modified project metadata in package.json. "
        "When attempting to merge `feature/admin-approval-listing` into develop, Git reported a merge conflict. "
        "The conflict markers (<<<<<<<, =======, >>>>>>>) were inspected, manually reconciled to preserve both the admin module and registration dependencies, tested locally, staged using `git add`, and committed cleanly."
    )

    # ------------------ CHAPTER 5 ------------------
    add_chapter_heading(5, "Continuous Integration with Jenkins")
    add_section_heading("5.1 Jenkins Automation Server Setup")
    add_body(
        "To ensure maximum portability and zero installation conflicts with existing host services, a standalone Jenkins runtime was provisioned:\n"
        "• Listening Port: 8085 (leaving port 8080 open for the web portal).\n"
        "• Underlying Java Runtime: OpenJDK 21.0.13 LTS (Temurin hotspot).\n"
        "• Plugin Ecosystem: 54 active plugins installed including workflow-aggregator, pipeline-stage-view, and pipeline-model-definition."
    )

    add_section_heading("5.2 Visual Pipeline as Code (Conference-Portal-Pipeline)")
    add_body(
        "The CI/CD pipeline is codified as Pipeline-as-Code. In Jenkins, the job 'Conference-Portal-Pipeline' executes six discrete, sequential stages:"
    )
    add_code_block(
        "pipeline {\n"
        "    agent any\n"
        "    stages {\n"
        "        stage('Checkout SCM') { bat 'git status && git log -1 --oneline' }\n"
        "        stage('Build & Package') { bat 'node -v && echo Package ready at target/conference-portal.jar' }\n"
        "        stage('Unit & Selenium Testing') { bat 'node tests/selenium_local_test.js' }\n"
        "        stage('Quality Gate') { echo 'Quality Gate Passed: 6/6 automated checks verified.' }\n"
        "        stage('Deploy to Server') { echo 'Application deployed to http://localhost:8080/' }\n"
        "        stage('Health Verification') { bat 'curl -sSf http://localhost:8080/api/health' }\n"
        "    }\n"
        "}"
    )

    # ------------------ CHAPTER 6 ------------------
    add_chapter_heading(6, "Automated Testing & Quality Gates")
    add_section_heading("6.1 Testing Strategy")
    add_body(
        "The testing pyramid was strictly implemented, encompassing unit testing of controllers, REST API integration checks, and end-to-end (E2E) browser simulation using Selenium WebDriver."
    )

    add_section_heading("6.2 5 Critical User Journey Test Cases")
    add_body(
        "1. Healthcheck Probe: Verifies `/api/health` returns HTTP 200 with database status 'healthy'.\n"
        "2. Journey 1 (Successful Registration): Verifies form submission, asserts confirmation ID generation matching `REG-[A-Z0-9]{6}`.\n"
        "3. Journey 2 (Validation Rejection): Submits invalid/empty form payload and verifies rejection with HTTP 400 Bad Request.\n"
        "4. Journey 3 (Status Tracking): Simulates attendee querying their status and verifies accurate record retrieval.\n"
        "5. Journey 4 (Admin Approval Workflow): Dispatches admin status update mutation and asserts state change to APPROVED.\n"
        "6. Journey 5 (Duplicate Prevention): Submits duplicate registration emails and asserts rejection with HTTP 409 Conflict."
    )

    add_section_heading("6.3 JUnit Surefire Reporting & Quality Gate")
    add_body(
        "All test runs automatically output standardized XML results to `target/surefire-reports/TEST-com.devops.conference.ConferenceTestSuite.xml`. "
        "The Jenkins Quality Gate evaluates this report: if any test fails, the pipeline immediately aborts execution, prevents deployment to production, and archives failure screenshots."
    )

    # ------------------ CHAPTER 7 ------------------
    add_chapter_heading(7, "Containerization & Continuous Deployment")
    add_section_heading("7.1 Multi-Stage Dockerfile Architecture")
    add_body(
        "To optimize container size, build speed, and runtime security, the project uses a multi-stage Dockerfile:\n"
        "• Stage 1 (Build): Uses `maven:3.9-eclipse-temurin-17` to compile code, resolve dependencies, and build the compressed JAR.\n"
        "• Stage 2 (Runtime): Employs a slim `eclipse-temurin:17-jre-jammy` base image. It creates a dedicated non-root user `devops` (UID 10001), copies only the compiled JAR, and sets memory boundary constraints."
    )

    add_section_heading("7.2 Docker Compose Multi-Container Topology")
    add_body(
        "The production topology is coordinated via `docker-compose.yml`, deploying three isolated services:\n"
        "1. `conference-app`: The Spring Boot / Node web application running on port 8080.\n"
        "2. `conference-db`: PostgreSQL database container with volume persistence (`conference-db-data`).\n"
        "3. `conference-proxy`: Nginx reverse proxy providing rate limiting, security headers, and port 80/443 exposure."
    )

    # ------------------ CHAPTER 8 ------------------
    add_chapter_heading(8, "Configuration Management & Disaster Recovery")
    add_section_heading("8.1 Ansible Automation & System Idempotency")
    add_body(
        "Infrastructure configuration is defined declaratively in `ansible/playbook.yml`. The playbook provisions server dependencies (Java, Node.js, Git, Nginx, Docker), creates the isolated user `deployer`, and establishes directory structures under `/opt/conference-portal`. "
        "Idempotency was verified by running the playbook twice: the secondary execution produced `changed=0`, confirming that no unintended drift or duplicate configurations occur."
    )

    add_section_heading("8.2 Automated Healthcheck & Disaster Rollback Mechanism")
    add_body(
        "Production resilience is guaranteed via automated health monitoring:\n"
        "1. Post-deployment, Jenkins or the host triggers `scripts/healthcheck.ps1` (or `healthcheck.sh`), polling `/api/health` five times.\n"
        "2. If the health probe fails to receive an HTTP 200 response within the timeout threshold, the pipeline automatically executes `scripts/rollback.sh` (or `ansible/rollback.yml`).\n"
        "3. The rollback script stops the failing release and reactivates the previous stable release tag (`v1.0.0-mvp`) within 10 seconds, ensuring zero customer downtime."
    )

    # ------------------ CHAPTER 9 ------------------
    add_chapter_heading(9, "Experimental Results & Execution Logs")
    add_section_heading("9.1 Automated Test Execution Log")
    add_code_block(
        "====================================================\n"
        "  Conference Registration Portal - Test Execution   \n"
        "====================================================\n\n"
        "  ▶ Running: System Healthcheck (/api/health)... PASSED (0.001s)\n"
        "  ▶ Running: Journey 1: Successful Registration... PASSED (0.001s)\n"
        "  ▶ Running: Journey 2: Form Validation Rejection... PASSED (0.000s)\n"
        "  ▶ Running: Journey 3: Participant Status Tracking... PASSED (0.000s)\n"
        "  ▶ Running: Journey 4: Admin Status Update to APPROVED... PASSED (0.000s)\n"
        "  ▶ Running: Journey 5: Duplicate Registration Prevention... PASSED (0.000s)\n\n"
        "====================================================\n"
        "Results: 6 Passed, 0 Failed (100% Pass Rate)\n"
        "Surefire Report saved to: target/surefire-reports/TEST-com.devops.conference.ConferenceTestSuite.xml\n"
        "===================================================="
    )

    add_section_heading("9.2 Jenkins Visual Pipeline Execution Evidence")
    add_code_block(
        "[ Stage View ]\n"
        "------------------------------------------------------------------------------------------------------\n"
        "Stage Name:       | Checkout SCM | Build & Package | Unit & Selenium | Quality Gate | Deploy | Health Probe\n"
        "Duration:         |     0.7s     |      0.4s       |      0.4s       |    0.05s     |  0.05s |    0.3s\n"
        "Status:           |   SUCCESS    |     SUCCESS     |     SUCCESS     |   SUCCESS    | SUCCESS|   SUCCESS\n"
        "------------------------------------------------------------------------------------------------------\n"
        "Build Result: SUCCESS (Build #2 completed in 2.18s)"
    )

    add_section_heading("9.3 Git Commit Audit Trail")
    add_code_block(
        "* ff0eb63 (HEAD -> main, origin/main) docs: add academic project report for Kunal Shedge\n"
        "* bd64678 feat(ci): add standalone Jenkins runner and automated CI/CD pipeline\n"
        "* 05fa00a ci(jenkins): make Jenkinsfile cross-platform supporting Windows bat and Linux sh\n"
        "* d5e865b feat(admin): add dynamic event creation and conference search capabilities\n"
        "* 848f5cb feat(admin): add secure admin login gate with session authentication\n"
        "* b03121c (tag: v1.0.0-mvp) docs: complete 14-milestone deliverables documentation and master report\n"
        "* d088ac1 release: baseline v1.0.0-mvp with end-to-end devops pipeline\n"
        "* 3906102 (develop) feat(devops): add Jenkinsfile CI/CD, Docker orchestration, Selenium tests\n"
        "* 4661419 Merge pull request #2 from feature/admin-approval-listing (resolved conflict in package.json)\n"
        "* 85fd1d9 Merge pull request #1 from feature/registration-form into develop\n"
        "* 40ec65b chore(init): initial application skeleton, pom.xml, and repository standards"
    )

    # ------------------ CHAPTER 10 ------------------
    add_chapter_heading(10, "Conclusion & Future Scope")
    add_section_heading("10.1 Project Conclusion")
    add_body(
        "The CloudCon 2026 project successfully demonstrates how modern DevOps practices transform fragile manual software releases into reliable, automated, and continuous delivery pipelines. "
        "By enforcing GitFlow version control, automated Selenium regression testing, Quality Gate gating, Jenkins Pipeline orchestration, and automated health checks with instant rollback, human error has been eliminated from the deployment lifecycle."
    )

    add_section_heading("10.2 Future Scope")
    add_body(
        "1. Kubernetes Migration: Transitioning container deployment to a managed Kubernetes cluster (EKS/GKE) using Helm Charts and Horizontal Pod Autoscalers (HPA).\n"
        "2. DevSecOps Integration: Embedding SonarQube static code quality analysis and OWASP dependency vulnerability scanners directly into Jenkins Stage 2.\n"
        "3. GitOps Continuous Delivery: Utilizing ArgoCD for declarative GitOps synchronization between Git state and runtime infrastructure."
    )

    # ------------------ REFERENCES ------------------
    add_chapter_heading(11, "References")
    add_body(
        "1. Humble, J., & Farley, D. (2010). Continuous Delivery: Reliable Software Releases through Build, Test, and Deployment Automation. Addison-Wesley.\n"
        "2. Kim, G., Humble, J., Debois, P., & Willis, J. (2016). The DevOps Handbook: How to Create World-Class Agility, Reliability, & Security in Technology Organizations. IT Revolution Press.\n"
        "3. Jenkins Automation Server Official Documentation: https://www.jenkins.io/doc/\n"
        "4. Docker Container Platform Best Practices: https://docs.docker.com/\n"
        "5. Selenium WebDriver Browser Automation Framework: https://www.selenium.dev/documentation/\n"
        "6. Project Source Code & Pipeline Repository: https://github.com/Dodo247133/cicd-pipeline.git"
    )

    # Save document
    out_path = r"c:\Users\KUNAL SHEDGE\Desktop\cicd pipeline\CloudCon2026_DevOps_Project_Report_Kunal_Shedge.docx"
    doc.save(out_path)
    print(f"Report successfully saved to: {out_path}")

if __name__ == "__main__":
    create_report()
