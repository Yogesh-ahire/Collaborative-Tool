export const templates = [
  {
    id: "blank",
    label: "Blank Document",
    imageUrl: "/blank-document.svg",
    initialContent: "",
  },

  {
    id: "software-proposal",
    label: "Software Development Proposal",
    imageUrl: "/software-proposal.svg",
    initialContent: `
      <h1 style="text-align: center;">Software Development Proposal</h1>
      <p><strong>Client:</strong> [Client Name]</p>
      <p><strong>Prepared By:</strong> [Your Company Name]</p>
      <p><strong>Date:</strong> [Date]</p>
      <hr/>
      <h2>1. Introduction</h2>
      <p>This proposal outlines the objectives, deliverables, and development plan for the proposed software solution.</p>

      <h2>2. Project Overview</h2>
      <p>The project aims to build a system that addresses the following key requirements:</p>
      <ul>
        <li>High scalability and performance</li>
        <li>User-friendly interface</li>
        <li>Secure data handling</li>
      </ul>

      <h2>3. Deliverables</h2>
      <ul>
        <li>Web and mobile applications</li>
        <li>Database and API integration</li>
        <li>Deployment and documentation</li>
      </ul>

      <h2>4. Estimated Timeline</h2>
      <p>Estimated completion within <strong>12 weeks</strong> from the project kickoff.</p>

      <h2>5. Pricing</h2>
      <p>Total project cost: <strong>$[Amount]</strong></p>

      <hr/>
      <p>We look forward to collaborating on this exciting project.</p>
      <p><em>Authorized Signature</em></p>
    `,
  },

  {
    id: "project-proposal",
    label: "Project Proposal",
    imageUrl: "/project-proposal.svg",
    initialContent: `
      <h1 style="text-align: center;">Project Proposal</h1>
      <p><strong>Project Title:</strong> [Enter Title]</p>
      <p><strong>Prepared By:</strong> [Your Name]</p>
      <p><strong>Date:</strong> [Date]</p>
      <hr/>

      <h2>1. Summary</h2>
      <p>Brief overview of the project goals, motivation, and desired outcomes.</p>

      <h2>2. Objectives</h2>
      <ul>
        <li>Define project scope and deliverables</li>
        <li>Establish success metrics</li>
        <li>Ensure timeline and budget alignment</li>
      </ul>

      <h2>3. Methodology</h2>
      <p>Describe your approach, tools, and techniques to achieve project goals.</p>

      <h2>4. Budget Estimate</h2>
      <p>Provide a high-level budget overview and resource allocation.</p>

      <h2>5. Expected Impact</h2>
      <p>Describe how the project will benefit stakeholders or solve specific problems.</p>
    `,
  },

  {
    id: "business-letter",
    label: "Business Letter",
    imageUrl: "/business-letter.svg",
    initialContent: `
      <p>[Your Name]</p>
      <p>[Your Company]</p>
      <p>[Address]</p>
      <p>[City, State ZIP]</p>
      <p>[Email]</p>
      <p>[Date]</p>

      <br/>

      <p>[Recipient Name]</p>
      <p>[Company Name]</p>
      <p>[Address]</p>

      <br/>

      <p>Dear [Recipient Name],</p>

      <p>I am writing to [state the purpose of the letter clearly and concisely].</p>

      <p>Thank you for your time and consideration. I look forward to your response.</p>

      <p>Sincerely,</p>
      <p><strong>[Your Name]</strong></p>
    `,
  },

  {
    id: "resume",
    label: "Resume",
    imageUrl: "/resume.svg",
    initialContent: `
      <h1 style="text-align: center;">[Your Full Name]</h1>
      <p style="text-align: center;">[Email] | [Phone Number] | [LinkedIn URL]</p>
      <hr/>

      <h2>Professional Summary</h2>
      <p>Dedicated and results-driven professional with expertise in [field/technology]. Committed to delivering quality solutions and continuous learning.</p>

      <h2>Experience</h2>
      <h3>[Job Title] – [Company Name]</h3>
      <p><em>[Start Date] – [End Date]</em></p>
      <ul>
        <li>Key responsibility or achievement #1</li>
        <li>Key responsibility or achievement #2</li>
      </ul>

      <h2>Education</h2>
      <p><strong>[Degree Name]</strong> – [Institution Name]</p>
      <p><em>[Year of Graduation]</em></p>

      <h2>Skills</h2>
      <ul>
        <li>Skill 1</li>
        <li>Skill 2</li>
        <li>Skill 3</li>
      </ul>
    `,
  },

  {
    id: "cover-letter",
    label: "Cover Letter",
    imageUrl: "/cover-letter.svg",
    initialContent: `
      <p>[Your Name]</p>
      <p>[Address]</p>
      <p>[Email]</p>
      <p>[Date]</p>

      <br/>

      <p>[Hiring Manager’s Name]</p>
      <p>[Company Name]</p>
      <p>[Company Address]</p>

      <br/>

      <p>Dear [Hiring Manager’s Name],</p>

      <p>I am excited to apply for the [Position Title] role at [Company Name]. With my background in [relevant skills/experience], I am confident that I can contribute effectively to your team.</p>

      <p>Thank you for considering my application. I look forward to the opportunity to discuss how I can add value to your organization.</p>

      <p>Sincerely,</p>
      <p><strong>[Your Name]</strong></p>
    `,
  },

  {
    id: "letter",
    label: "Letter",
    imageUrl: "/letter.svg",
    initialContent: `
      <p>[Your Name]</p>
      <p>[Your Address]</p>
      <p>[City, State ZIP]</p>
      <p>[Date]</p>

      <br/>

      <p>Dear [Recipient Name],</p>

      <p>I hope this letter finds you well. [Write your message here with clarity and sincerity.]</p>

      <p>Warm regards,</p>
      <p><strong>[Your Name]</strong></p>
    `,
  },
];
