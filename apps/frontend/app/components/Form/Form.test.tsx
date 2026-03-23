import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "./Form";

describe("Form", () => {
  it("renders form", async () => {
    render(<Form />);
    const form = screen.getByTestId("form");

    expect(form).toBeInTheDocument();
  });

  it("password field and validation text under inputs work correctly", async () => {
    render(<Form />);
    const passwordValidation = screen.getByTestId("password-validation");
    const passwordInput = screen.getByLabelText("Password");

    expect(passwordValidation).toHaveTextContent(
      "You can't sign up with this password",
    );

    await userEvent.type(passwordInput, "Aa1");
    expect(passwordValidation).toHaveTextContent(
      "You can't sign up with this password",
    );
    await userEvent.clear(passwordInput);

    expect(passwordValidation).toHaveTextContent(
      "You can't sign up with this password",
    );

    await userEvent.type(passwordInput, "aa12");
    expect(passwordValidation).toHaveTextContent(
      "You can't sign up with this password",
    );
    await userEvent.clear(passwordInput);

    await userEvent.type(passwordInput, "A1cat");
    expect(passwordValidation).toHaveTextContent(
      "You can't sign up with this password",
    );
    await userEvent.clear(passwordInput);

    await userEvent.type(passwordInput, "Aa12");
    expect(passwordValidation).toHaveTextContent(
      "You can sign up with this password",
    );
  });

  it("submit button with alert message works correctly", async () => {
    render(<Form />);
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    const submitButton = screen.getByTestId("submit-button");
    const nameInput = screen.getByLabelText("Name");
    const passwordInput = screen.getByLabelText("Password");

    await userEvent.type(nameInput, "John Doe");
    await userEvent.type(passwordInput, "Aa1234");

    await userEvent.click(submitButton);

    expect(alertSpy).toHaveBeenCalledWith(
      JSON.stringify({ name: "John Doe", password: "Aa1234" }, null, 2),
    );
    alertSpy.mockRestore();
  });
});
