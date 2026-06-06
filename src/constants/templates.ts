import { JSONContent } from "@/types/editor";

type Template = {
  id: string;
  label: string;
  imageUrl: string;
  initialContent: JSONContent;
};

export const templates: Template[] = [
  {
    id: "blank",
    label: "Blank Document",
    imageUrl: "/blank-document.svg",
    initialContent: {
      type: "doc",
      content: [],
    },
  },
  {
    id: "import-docx",
    label: "Import Document",
    imageUrl: "/import-docx.png",
    initialContent: {
      type: "doc",
      content: [],
    },
  },
  {
    id: "software-proposal",
    label: "Software Development Proposal",
    imageUrl: "/software-proposal.svg",
    initialContent: {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Software Development Proposal" }] },
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Executive Summary" }] },
        { type: "paragraph", content: [{ type: "text", text: "This proposal outlines the technical solution for [Client Name] to develop [Project Name]." }] },
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Technical Stack" }] },
        { type: "paragraph", content: [{ type: "text", text: "Frontend: React.js/Next.js\nBackend: Java Spring Boot\nDatabase: PostgreSQL" }] }
      ],
    },
  },
  {
    id: "project-proposal",
    label: "Project Proposal",
    imageUrl: "/project-proposal.svg",
    initialContent: {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Project Proposal: [Title]" }] },
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "1. Problem Statement" }] },
        { type: "paragraph", content: [{ type: "text", text: "Describe the current problem being solved here..." }] },
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "2. Proposed Methodology" }] },
        { type: "paragraph", content: [{ type: "text", text: "Detailed steps of implementation..." }] }
      ],
    },
  },
  {
    id: "business-letter",
    label: "Business Letter",
    imageUrl: "/business-letter.svg",
    initialContent: {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "[Sender Name]\n[Sender Address]\n\n[Date]\n\n[Recipient Name]\n[Recipient Address]\n\nDear [Name]," }] },
        { type: "paragraph", content: [{ type: "text", text: "I am writing to formally request..." }] },
        { type: "paragraph", content: [{ type: "text", text: "Sincerely,\n[Name]" }] }
      ],
    },
  },
  {
    id: "resume",
    label: "Resume",
    imageUrl: "/resume.svg",
    initialContent: {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "[Your Full Name]" }] },
        { type: "paragraph", content: [{ type: "text", text: "[Email] | [Phone] | [LinkedIn Profile]" }] },
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Professional Summary" }] },
        { type: "paragraph", content: [{ type: "text", text: "Motivated Full-Stack Developer with expertise in Java, React, and distributed systems." }] },
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Experience" }] },
        { type: "paragraph", content: [{ type: "text", text: "[Company Name] | [Role] | [Dates]" }] }
      ],
    },
  },
  {
    id: "cover-letter",
    label: "Professional Cover Letter",
    imageUrl: "/cover-letter.svg",
    initialContent: {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "[Your Name]\n[Your Address]\n[Date]" }] },
        { type: "paragraph", content: [{ type: "text", text: "[Hiring Manager Name]\n[Company Name]\n[Company Address]" }] },
        { type: "paragraph", content: [{ type: "text", text: "Dear Hiring Manager," }] },
        { type: "paragraph", content: [{ type: "text", text: "I am writing to express my strong interest in the [Position Name] role at [Company Name]. With my background in [Your Field] and my technical proficiency in [Key Skill], I am confident in my ability to contribute to your team." }] },
        { type: "paragraph", content: [{ type: "text", text: "Sincerely,\n[Your Name]" }] }
      ],
    },
  },
  {
    id: "formal-letter",
    label: "Formal Request Letter",
    imageUrl: "/letter.svg",
    initialContent: {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "To,\nThe Principal,\n[College/Organization Name],\n[Date]" }] },
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Subject: [Mention Subject Here]" }] },
        { type: "paragraph", content: [{ type: "text", text: "Respected Sir/Madam,\n\nI am writing this letter to request [Purpose of Request]. I have attached the necessary documents for your reference." }] },
        { type: "paragraph", content: [{ type: "text", text: "Thank you for considering my request.\n\nYours sincerely,\n[Your Name]\n[Your ID/Roll No]" }] }
      ],
    },
  },
];