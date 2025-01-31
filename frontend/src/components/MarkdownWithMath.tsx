import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

export const _mapProps = (props: any) => ({
  ...props,
  remarkPlugins: [remarkMath, [remarkGfm, { singleTilde: false }]],
  rehypePlugins: [rehypeKatex],
  components: {
    math: ({ value }: any) => (
      <div dangerouslySetInnerHTML={{ __html: value }} />
    ),
    inlineMath: ({ value }: any) => (
      <span dangerouslySetInnerHTML={{ __html: value }} />
    ),
  },
});

export const Markdown = (props: any) => <ReactMarkdown {..._mapProps(props)} />;
