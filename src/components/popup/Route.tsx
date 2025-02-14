import { AnimatePresence, motion, type Variants } from "framer-motion";
import { type HistoryAction, useHistory } from "~utils/hash_router";
import { createElement, type PropsWithChildren } from "react";
import { useRoute, Route as BaseRoute } from "wouter";
import styled from "styled-components";

/**
 * Custom Route component that allows iOS-like animations
 */
const Route: typeof BaseRoute = ({ path, component, children }) => {
  const [matches, params] = useRoute(path);
  const routeContent = component
    ? createElement(component, { params })
    : typeof children === "function"
    ? children(params)
    : children;

  const [, _, action] = useHistory();

  return (
    <AnimatePresence initial={false}>
      {matches && <Page action={action}>{routeContent}</Page>}
    </AnimatePresence>
  );
};

export const Wrapper = styled(motion.div)<{
  responsive?: boolean;
  expanded?: boolean;
}>`
  position: relative;
  width: ${(props) => (props.responsive ? "100%" : "377.5px")};
  min-height: ${(props) => (props.expanded ? "100vh" : "600px")};
  max-height: max-content;
  background-color: rgb(${(props) => props.theme.background});
`;

const PageWrapper = styled(Wrapper)`
  position: absolute;
  top: 0;
  width: 100%;
  transition: background-color 0.23s ease-in-out;
`;

const Page = ({
  children,
  action
}: PropsWithChildren<{ action: HistoryAction }>) => {
  const transition = { ease: [0.42, 0, 0.58, 1], duration: 0.27 };
  const pageAnimation: Variants = {
    enter: {
      x: 0,
      transition,
      ...(action === "push"
        ? {
            right: 0,
            left: 0,
            bottom: 0
          }
        : {})
    },
    initial: {
      x: action === "push" ? "100%" : "-25%",
      transition,
      ...(action === "push"
        ? {
            right: 0,
            left: 0,
            bottom: 0
          }
        : {})
    },
    exit: {
      x: action === "pop" ? "100%" : "-10%",
      zIndex: action === "pop" ? 1 : -1,
      transition,
      ...(action === "pop"
        ? {
            right: 0,
            left: 0,
            bottom: 0
          }
        : {})
    }
  };

  const opacityAnimation: Variants = {
    initial: { opacity: 0, scale: 0.8 },
    enter: { opacity: 1, scale: 1 },
    exit: { opacity: 0, y: 0, transition: { duration: 0.2 } }
  };

  return (
    <PageWrapper
      initial="initial"
      animate="enter"
      exit="exit"
      variants={
        new URLSearchParams(window.location.search).get("expanded")
          ? opacityAnimation
          : pageAnimation
      }
    >
      {children}
    </PageWrapper>
  );
};

export default Route;
