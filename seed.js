import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import Post from "./models/post.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const posts = [
  {
    title: "The Future of Artificial Intelligence in Web Development",
    content:
      "<p>Artificial Intelligence is revolutionizing the way we build and interact with web applications. From intelligent chatbots to automated code generation, AI is becoming an indispensable tool for developers. In this article, we explore the latest AI trends shaping the future of web development.</p><p>Machine learning models are now being integrated directly into browsers, enabling real-time personalization without server roundtrips. Tools like GitHub Copilot and ChatGPT are assisting developers in writing cleaner, more efficient code.</p>",
    category: "technology",
    slug: "future-of-ai-in-web-development",
  },
  {
    title: "React Server Components: A Complete Guide",
    content:
      "<p>React Server Components represent a paradigm shift in how we build React applications. By moving data-fetching logic to the server, RSC reduces bundle sizes and improves performance. This guide covers everything you need to know about adopting RSC in your projects.</p><p>Learn how server components work, when to use them, and how they interact with client components in the new React architecture.</p>",
    category: "technology",
    slug: "react-server-components-complete-guide",
  },
  {
    title: "Mastering TypeScript for Modern JavaScript Projects",
    content:
      "<p>TypeScript has become the de facto standard for large-scale JavaScript applications. Its static typing system catches errors early and improves developer experience. Discover advanced TypeScript patterns, generics, and best practices that will level up your coding skills.</p>",
    category: "technology",
    slug: "mastering-typescript-for-modern-javascript",
  },
  {
    title: "Building Scalable APIs with Node.js and Express",
    content:
      "<p>Node.js and Express remain the backbone of countless backend services. In this post, we dive deep into building scalable, maintainable APIs using modern Node.js features, middleware patterns, and architectural best practices.</p><p>From authentication to rate limiting, learn how to design APIs that can handle millions of requests with ease.</p>",
    category: "technology",
    slug: "building-scalable-apis-nodejs-express",
  },
  {
    title: "The Rise of Edge Computing and What It Means for Developers",
    content:
      "<p>Edge computing is bringing computation closer to users, reducing latency and improving performance. Explore how platforms like Cloudflare Workers and Vercel Edge Functions are changing the deployment landscape for web developers.</p>",
    category: "technology",
    slug: "rise-of-edge-computing-for-developers",
  },
  {
    title: "Docker and Kubernetes: Essential Tools for 2024",
    content:
      "<p>Containerization has transformed how we deploy and manage applications. Docker simplifies packaging, while Kubernetes orchestrates containers at scale. This article walks you through setting up a production-ready container workflow.</p>",
    category: "technology",
    slug: "docker-and-kubernetes-essential-tools",
  },
  {
    title: "Introduction to WebAssembly and Its Use Cases",
    content:
      "<p>WebAssembly enables near-native performance in web browsers. Learn how Wasm is being used for image processing, gaming, scientific computing, and more. We also cover how to integrate Wasm modules into your existing JavaScript applications.</p>",
    category: "technology",
    slug: "introduction-to-webassembly-use-cases",
  },
  {
    title: "GraphQL vs REST: Which API Architecture Should You Choose?",
    content:
      "<p>The debate between GraphQL and REST continues to evolve. While REST remains simple and widely adopted, GraphQL offers flexibility and efficiency for complex data requirements. We compare both approaches and help you decide which fits your project best.</p>",
    category: "technology",
    slug: "graphql-vs-rest-api-architecture",
  },
  {
    title: "Cybersecurity Best Practices Every Developer Should Know",
    content:
      "<p>Security is no longer optional. From SQL injection to XSS attacks, threats are everywhere. This post covers essential cybersecurity practices every developer must implement to protect their applications and users.</p>",
    category: "technology",
    slug: "cybersecurity-best-practices-developers",
  },
  {
    title: "The Evolution of Frontend Frameworks: What's Next?",
    content:
      "<p>From jQuery to React, Vue, and Svelte, frontend frameworks have come a long way. We examine the current landscape, emerging trends, and what the future holds for building user interfaces on the web.</p>",
    category: "technology",
    slug: "evolution-of-frontend-frameworks",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    let createdCount = 0;
    for (const post of posts) {
      const existing = await Post.findOne({ $or: [{ title: post.title }, { slug: post.slug }] });
      if (existing) {
        console.log(`Skipping (already exists): ${post.title}`);
        continue;
      }
      await Post.create({
        ...post,
        userId: "6a90019ee454b9cc0c5ca89c",
        image: `https://via.placeholder.com/800x400?text=${encodeURIComponent(post.title)}`,
      });
      console.log(`Created: ${post.title}`);
      createdCount++;
    }

    console.log(`\nSuccessfully created ${createdCount} posts.`);
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();