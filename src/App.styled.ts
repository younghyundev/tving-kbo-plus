import { createGlobalStyle, styled } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root {
    color-scheme: light;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: #ffffff;
    font-family: Arial, "Apple SD Gothic Neo", sans-serif;
  }
`;

export const Container = styled.main`
  width: 320px;
  padding: 16px;
  background-color: #ffffff;
  color: #000000;
`;

export const Title = styled.h1`
  margin: 0 0 4px;
  font-size: 18px;
  line-height: 1.4;
  color: #000000;
  text-wrap: balance;
`;

export const SettingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
`;

export const SettingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background-color: #f0f0f0;
  border-radius: 8px;
`;

export const Label = styled.span`
  flex: 1;
  min-width: 0;
  color: #000000;
  font-size: 13px;
  line-height: 1.4;
  overflow-wrap: anywhere;
`;

export const ToggleButton = styled.button<{ $isActive: boolean }>`
  position: relative;
  flex: 0 0 50px;
  height: 24px;
  padding: 0;
  background-color: ${(props) => (props.$isActive ? "#16853f" : "#767676")};
  border-radius: 12px;
  border: none;
  cursor: pointer;
  touch-action: manipulation;
  transition: background-color 0.2s ease-in-out;

  &::before {
    content: "";
    position: absolute;
    left: 2px;
    top: 2px;
    width: 20px;
    height: 20px;
    background-color: white;
    border-radius: 50%;
    transform: ${(props) => (props.$isActive ? "translateX(26px)" : "translateX(0)")};
    transition: transform 0.2s ease-in-out;
  }

  &:hover {
    background-color: ${(props) => (props.$isActive ? "#0f6f34" : "#5f5f5f")};
  }

  &:focus-visible {
    outline: 2px solid #0866ff;
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    &, &::before {
      transition-duration: 0.01ms;
    }
  }
`;

export const Notice = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: #666666;
`;
