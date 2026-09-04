# CrowdGuard: Privacy-Preserving Crowd Density Estimator

**Smart AI-Powered Monitoring for Safer Public Spaces**  
**Mass Surveillance vs Public Safety Hackathon** | 48-Hour Build


 *Monitor Density.Preserve Dignity*
<!-- Replace with actual banner image once designed -->
<div align="center">

![Python](https://img.shields.io/badge/Python-3.11%2B-blue?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)

</div>

## Team Title

**MetriX**  
**[ Privacy-First AI Innovators ]**



<a href="https://github.com/MediaTrex/Codorra_2026_Hackathon/graphs/contributors">
  <img src="https://contributors-img.web.app/image?repo=MediaTrex/Codorra_2026_Hackathon"  />
</a>

## Project Screenshots

### CrowdGuard - Complete UI Overview

<table>
  <tr>
    <td align="center"><img src="./docs/images/Login.jpeg" width="245" alt="Login"><br><strong>1. Login</strong></td>
    <td align="center"><img src="./docs/images/Dashboard.jpeg" width="245" alt="Dashboard"><br><strong>2. Dashboard</strong></td>
    <td align="center"><img src="./docs/images/Live_monitoring.jpeg" width="245" alt="Live Monitoring"><br><strong>3. Live Monitoring</strong></td>
    <td align="center"><img src="./docs/images/heatmap.jpeg" width="245" alt="Heatmap"><br><strong>4. Heatmap</strong></td>
  </tr>
  <tr>
    <td align="center"><img src="./docs/images/Analytics.jpeg" width="245" alt="Analytics"><br><strong>5. Analytics</strong></td>
    <td align="center"><img src="./docs/images/Alerts.jpeg" width="245" alt="Alerts"><br><strong>6. Alerts</strong></td>
    <td align="center"><img src="./docs/images/Reports.jpeg" width="245" alt="Reports"><br><strong>7. Reports</strong></td>
    <td align="center"><img src="./docs/images/Settings.jpeg" width="245" alt="Settings"><br><strong>8. Settings</strong></td>
  </tr>
</table>

<p align="center">
  <em>Privacy-Preserving AI-Powered Crowd Monitoring System</em>
</p>


---

## Problem Statement & Research Insights

**The Challenge**:  

Modern smart cities face a critical tension — **mass surveillance for public safety** versus **citizen privacy**. Traditional crowd monitoring systems often rely on facial recognition, identity tracking, and centralized raw video storage, leading to:

- **Privacy Erosion**: Constant tracking raises concerns about mass surveillance, data breaches, and misuse (e.g., mission creep beyond safety).
- **Public Safety Risks**: Overcrowding in public spaces (events, transit hubs, markets) can lead to stampedes, chaos, or emergencies. Studies show real-time density monitoring can prevent disasters.
- **Bias & Inefficiency**: Systems trained on biased data over-police certain areas; raw footage storage increases breach risks.

**Global Context** (2025-2026):
- Cities worldwide (Singapore, Ahmedabad, New York) deploy AI crowd systems for safety, yet privacy regulations like GDPR and growing public distrust demand **Privacy-by-Design**.
- Research highlights the need for **edge processing**, **anonymization**, and **density estimation without PII** (Personally Identifiable Information).
**Our Solution Addresses This Head-On**: A privacy-first system that delivers actionable safety insights **without compromising individual rights**.

---

## Solution Approach

**CrowdGuard** uses **anonymous computer vision** to estimate crowd density, detect overcrowding risks, generate heatmaps, and send real-time alerts — all while ensuring **zero facial recognition** and **no identity tracking**. It addresses the challenge of monitoring and managing large crowds in public spaces while protecting individual privacy. Traditional surveillance systems often rely on facial recognition and identity tracking, which can raise serious privacy and ethical concerns. Our solution uses AI-powered computer vision to estimate crowd density, detect overcrowding, and generate real-time safety alerts without identifying or storing any personal information. By automatically counting people, analyzing crowd distribution, and visualizing density through dashboards and heatmaps, the system helps authorities make informed decisions to prevent congestion, improve public safety, and respond quickly to potential risks. At the same time, privacy-preserving techniques such as face blurring and anonymous analytics ensure that citizens' identities remain protected, creating a balance between public safety and personal privacy.

### Key Differentiators:
- **Privacy-First**: Processes data at the edge; only aggregated, anonymized metrics are stored/transmitted.
- **Real-Time & Actionable**: Heatmaps + alerts for unsafe conditions.
- **Ethical AI**: Fully auditable, transparent, and compliant with privacy best practices.
- **Scalable Smart-City Architecture**: Designed to support multiple camera feeds across malls, stadiums, metro stations, airports, and other public spaces from a centralized dashboard.
- **Low-Cost Deployment**: Leverages existing CCTV infrastructure and lightweight AI models, reducing implementation costs for cities and organizations.
- **Predictive Safety Insights**: Analyzes historical crowd patterns to identify peak hours and potential overcrowding risks before they become critical situations.

---



## Tech Stack & Reasoning

| Component       | Technology                  | Why We Chose It |
|-----------------|-----------------------------|-----------------|
| **Backend**    | **FastAPI**                | Excellent AI integration, native async support, built-in Swagger docs, Python ecosystem, and fastest hackathon development speed. Superior to Express for AI-heavy workloads. |
| **Frontend**   | **ReactJS**                | Fast, component-based UI for interactive dashboards, heatmaps, and real-time updates. |
| **Database**   | **MongoDB**                | Flexible schema for storing anonymized analytics, heatmaps, and alerts. Perfect for FARM stack scalability. |
| **AI Engine**  | **YOLO (v8+)** + **OpenCV** | State-of-the-art real-time object detection for people counting/density. Lightweight, accurate, and runs efficiently on edge devices. |
| **Heatmaps & Analytics** | OpenCV + Matplotlib/Seaborn | Fast generation of visual insights from anonymized data. |
| **Deployment** | Docker (recommended)       | Easy reproducibility and scalability. |

**Why this stack?** It aligns perfectly with your architecture decision — **AI-heavy**, rapid prototyping in 48 hours, and production-ready.

---
## System Architecture & Data Flow

```mermaid
flowchart LR
    Cam[📹 Public Camera / Webcam] 
    
    subgraph Edge["Edge Layer (Privacy-Preserving)"]
        YOLO[YOLOv8 + OpenCV<br/>Object Detection]
        PP[Privacy Processor<br/>Anonymization + Density Calc]
    end
    
    subgraph Processing["Processing Layer"]
        Density[Crowd Density Engine]
        Heat[Heatmap Generator]
        Alert[Overcrowding Alert System]
    end
    
    subgraph Backend["Backend"]
        API[FastAPI API]
        DB[(MongoDB<br/>Anonymized Analytics)]
    end
    
    subgraph Frontend["Frontend"]
        Dash[React Dashboard]
        Viz[Interactive Heatmaps + Alerts]
    end

    Cam --> YOLO
    YOLO --> PP
    PP --> Density
    Density --> Heat
    Density --> Alert
    Heat --> API
    Alert --> API
    API <--> DB
    API --> Dash
    Dash --> Viz

    classDef privacy fill:#10b981,stroke:#047857,color:white,rx:15,ry:15
    class PP privacy

```
### Overview:

```mermaid
graph TD
    A[AI Engine] -->|Sends data| B[Backend API]
    B -->|Stores data| C[MongoDB]
    B -->|Provides data| D[React Dashboard]
    E[Video Processing] -->|Sends analytics| B
```
    
**Workflow**:
1. Video stream processed locally/on-edge.
2. YOLO detects people → count & density calculated (no identities).
3. Heatmap generated and alerts triggered if thresholds exceeded.
4. Anonymized data saved → visualized on dashboard.

---

## API Guide & Documentation

API Guide Links: <br/>

[Setup APIs Guide](./API_GUIDE.md)  <br/>
[AI Engine API Guide](./ai-engine/Documentations/COMPLETION_CHECKLIST.md) <br/>
[Backend APIs Guide](./backend/API_documentation.md) <br/>

Documention Links: <br/>

[Project Architecture Documentation](./ai-engine/Documentations/ARCHITECTURE.md) <br/>
[Frontend Documentation](./frontend/README.md) <br/>
[AI Engine Documentation](./ai-engine/README.md) <br/>
[AI Engine Quickstart](./ai-engine/Documentations/QUICKSTART.md)

## Key Features & Innovation

**MUST-HAVE MVP Features**:
- Real-time **Crowd Density Detection**
- **Overcrowding Risk Alerts**
- **Privacy-Preserving Heatmaps**
- **Anonymous Analytics Dashboard**

**Innovation Highlights**:
- **Zero Identity Tracking** — Strong differentiator vs. traditional surveillance.
- **Edge-First Processing** — Minimizes data centralization risks.
- **Ethical Transparency** — Built-in audit logs and privacy metrics.

---

## Future Scope & Scalability

- Multi-camera support with Federated Learning.
- Integration with IoT sensors and smart city platforms.
- Mobile app for authorities/citizens (privacy-controlled views).
- Advanced anomaly detection (e.g., panic movement patterns).
- Cloud/On-Prem deployment options for global cities.

**Potential Impact**: Deployable in malls, stadiums, transit hubs, and festivals worldwide — balancing safety and civil liberties.

---
## Conclusion

CrowdGuard proves that public safety and privacy can coexist. By using edge AI and privacy-by-design, we built a system that protects lives in crowded spaces without enabling mass surveillance.
*A balanced, ethical solution for modern smart cities.*



