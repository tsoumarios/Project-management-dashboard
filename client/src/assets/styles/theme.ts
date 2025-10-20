import styled from "styled-components";
import { NavLink } from "react-router-dom";

export const theme = {
  colors: {
    primary: "#2F80ED",
    black: "#1A1A1A",
    white: "#FFF",
    gray: "#7D7D7D",
    green: "#27AE60",
    red: "#EB5757",
  },
  spacing: (v: number) => `${v * 8}px`,
  radius: "12px",
};

export const Wrapper = styled.div`
  max-width: 1200px;
  margin: auto;
  padding: ${({ theme }) => theme.spacing(3)};
`;

export const NavContainer = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  padding: 12px 24px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
`;

export const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  font-size: 0.95rem;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
`;

export const StyledLink = styled(NavLink)`
  text-decoration: none;
  color: #333;
  font-weight: 500;
  font-size: 0.95rem;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;

  &.active {
    background: #2f80ed;
    color: white;
  }

  &:hover {
    background: rgba(47, 128, 237, 0.1);
  }
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Modal = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 400px;
`;

export const Card = styled.div<{ selected?: boolean }>`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius};
  padding: ${({ theme }) => theme.spacing(2)};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: 0.2s;
  border: ${({ selected }) =>
    selected ? "2px solid #2F80ED" : "2px solid transparent"};
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
  }
`;

export const ProgressBar = styled.div<{ $value: number }>`
  height: 6px;
  background: #eee;
  border-radius: 3px;
  margin-top: 6px;
  overflow: hidden;

  &::after {
    content: "";
    display: block;
    width: ${({ $value }) => Math.min(Math.max($value, 0), 100)}%;
    height: 100%;
    background: #2f80ed;
    transition: width 0.3s;
  }
`;

export const EditButton = styled.button`
  background: #2f80ed;
  color: white;
  border: none;
  padding: 5px 30px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  margin: 10px 0;
  transition: background 0.2s;
  &:hover {
    background: #1c63c5;
  }
`;

// Delete button
export const DangerButton = styled.button`
  background: #e74c3c;
  color: #fff;
  border: none;
  padding: 5px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-left: 8px;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.9;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Health indicator
export const Health = styled.span<{ $level: string }>`
  font-weight: 600;
  color: ${({ $level }) =>
    $level === "good"
      ? "#27ae60"
      : $level === "warning"
      ? "#f39c12"
      : $level === "critical"
      ? "#e74c3c"
      : "#555"};
`;

// Status pill
export const StatusBadge = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  user-select: none;

  background: ${({ $status }) =>
    $status === "active"
      ? "rgba(39, 174, 96, 0.12)"
      : $status === "paused"
      ? "rgba(243, 156, 18, 0.14)"
      : $status === "completed"
      ? "rgba(47, 128, 237, 0.12)"
      : "rgba(130, 130, 130, 0.14)"};

  color: ${({ $status }) =>
    $status === "active"
      ? "#1e8e57"
      : $status === "paused"
      ? "#a66b00"
      : $status === "completed"
      ? "#1c63c5"
      : "#555"};

  border: 1px solid
    ${({ $status }) =>
      $status === "active"
        ? "rgba(39, 174, 96, 0.25)"
        : $status === "paused"
        ? "rgba(243, 156, 18, 0.3)"
        : $status === "completed"
        ? "rgba(47, 128, 237, 0.25)"
        : "rgba(130, 130, 130, 0.25)"};
`;

// Tag styles
export const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
`;

export const Tag = styled.span`
  background: #f2f2f2;
  color: #333;
  font-size: 0.8rem;
  padding: 3px 8px;
  border-radius: 10px;
`;

export const Row = styled.div`
  margin-top: 12px;
  display: flex;
  gap: 12px;
`;

export const Field = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 0.9rem;
    color: #333;
  }
  input,
  textarea,
  select {
    padding: 8px 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 0.95rem;
  }
  textarea {
    min-height: 80px;
    resize: vertical;
  }
`;

export const Footer = styled.div`
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

export const Button = styled.button<{ variant?: "primary" | "outline" }>`
  padding: 8px 16px;
  border-radius: 8px;
  border: ${({ variant }) =>
    variant === "outline" ? "1px solid #2F80ED" : "none"};
  background: ${({ variant }) =>
    variant === "outline" ? "transparent" : "#2F80ED"};
  color: ${({ variant }) => (variant === "outline" ? "#2F80ED" : "#fff")};
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Grid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
`;

export const Bar = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
`;

export const Input = styled.input`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  flex: 1;
  min-width: 200px;
`;

export const Select = styled.select`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
`;

export const TagInput = styled(Input)`
  width: 180px;
`;

export const ClearButton = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.2s;

  &:hover {
    background: #c0392b;
  }
`;

export const Pager = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
`;

export const PageInfo = styled.span`
  opacity: 0.7;
  font-size: 0.9rem;
`;

export const BackButton = styled.button`
  background: #2f80ed;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-bottom: 20px;
  transition: background 0.2s;

  &:hover {
    background: #1c63c5;
  }
`;

export const ViewButton = styled.button`
  margin: 12px 0;
  background: #2f80ed;
  color: #fff;
  border: none;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #1c63c5;
  }
`;
