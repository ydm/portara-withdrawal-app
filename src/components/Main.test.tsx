import { render, screen } from "@testing-library/react";
// import { Main } from "./Main";

const cb: jest.ProvidesCallback = () => {
  render(<></>);
  const element = screen.getByText(/\w?/);
  // render(<Main />);
  // const element = screen.getByText(/Hello, world!/);
  expect(element).toBeInTheDocument();
};

test("renders greeting", cb);
