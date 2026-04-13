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
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Software Development Proposal" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Client: [Client Name]" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Prepared By: [Your Company Name]" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Date: [Date]" }],
        },
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
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Project Proposal" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Project Title: [Enter Title]" }],
        },
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
        {
          type: "paragraph",
          content: [{ type: "text", text: "[Your Name]" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Dear [Recipient Name]," }],
        },
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
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "[Your Full Name]" }],
        },
      ],
    },
  },
  {
    id: "cover-letter",
    label: "Cover Letter",
    imageUrl: "/cover-letter.svg",
    initialContent: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Dear [Hiring Manager]," }],
        },
      ],
    },
  },
  {
    id: "letter",
    label: "Letter",
    imageUrl: "/letter.svg",
    initialContent: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Dear [Recipient]," }],
        },
      ],
    },
  },
];