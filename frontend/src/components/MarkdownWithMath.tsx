import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import "katex/dist/katex.min.css";
import { FileEdit } from "lucide-react";
import TeX from "@matejmazur/react-katex";

const defaultContent = `# Quadratic Functions

The equation shown is \\( y = ax^2 + b \\), which is a form of a quadratic function. This represents a parabola that opens upwards if \\( a > 0 \\) and downwards if \\( a < 0 \\).

## The Quadratic Formula

Let's look at the complete quadratic formula:

\\[ x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} \\]

## Vertex Form

The vertex form of a quadratic function is:

\\[ f(x) = a(x - h)^2 + k \\]

where \\( (h, k) \\) is the vertex of the parabola.`;

function splitContent(content: string): string[] {
  // Split by both inline and display math delimiters
  return content.split(/(\\\(.*?\\\)|\\\[.*?\\\])/gs).filter(Boolean);
}

function isMathBlock(block: string): boolean {
  return block.startsWith("\\[") && block.endsWith("\\]");
}

function isInlineMath(block: string): boolean {
  return block.startsWith("\\(") && block.endsWith("\\)");
}

function cleanMathContent(math: string): string {
  // Remove delimiters and trim whitespace
  return math
    .replace(/^\\\(|\\\)$|\\\[|\\\]$/g, "")
    .trim()
    .replace(/\\\\/g, "\\"); // Replace double backslashes with single
}

function renderContent(blocks: string[]) {
  let currentParagraph: React.ReactNode[] = [];
  const result: React.ReactNode[] = [];
  let key = 0;

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      result.push(
        <span key={key++} className="inline">
          {currentParagraph}
        </span>
      );
      currentParagraph = [];
    }
  };

  blocks.forEach((block) => {
    if (isMathBlock(block)) {
      flushParagraph();
      result.push(
        <div key={key++} className="my-4">
          <TeX math={cleanMathContent(block)} block />
        </div>
      );
    } else if (isInlineMath(block)) {
      currentParagraph.push(
        <span key={key++} className="inline-block align-middle">
          <TeX math={cleanMathContent(block)} />
        </span>
      );
    } else {
      // Split the markdown block by newlines to handle paragraphs properly
      const paragraphs = block.split(/\n\n+/);
      paragraphs.forEach((paragraph, index) => {
        if (paragraph.trim()) {
          if (index > 0) {
            flushParagraph();
          }
          currentParagraph.push(
            <span key={key++} className="inline">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <span className="inline">{children}</span>
                  ),
                  // Handle headings as block elements
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold mt-6 mb-4 block">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold mt-6 mb-3 block">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-bold mt-5 mb-2 block">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-lg font-bold mt-4 mb-2 block">
                      {children}
                    </h4>
                  ),
                  h5: ({ children }) => (
                    <h5 className="text-base font-bold mt-4 mb-2 block">
                      {children}
                    </h5>
                  ),
                  h6: ({ children }) => (
                    <h6 className="text-sm font-bold mt-4 mb-2 block">
                      {children}
                    </h6>
                  ),
                }}
              >
                {paragraph}
              </ReactMarkdown>
            </span>
          );
        }
      });
    }
  });

  flushParagraph();
  return result;
}

export function MarkdownWithMath({ children }: { children: string }) {
  const [content, setContent] = useState(defaultContent);
  const [isEditing, setIsEditing] = useState(false);

  const blocks = splitContent(children);

  return (
    <div>
      {/* If we want markdown editing capabilities, this could help! */}
      {/* <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileEdit className="h-6 w-6 text-indigo-600" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">Math Markdown Editor</h1>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              {isEditing ? 'Preview' : 'Edit'}
            </button>
          </div>
        </div>
      </nav> */}

      {isEditing ? (
        <div className="p-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-[calc(100vh-16rem)] p-4 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your content here..."
          />
        </div>
      ) : (
        <article className="prose prose-indigo max-w-none p-6">
          {renderContent(blocks)}
        </article>
      )}
    </div>
  );
}
