import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('App', () => {
  it('renders the main heading and callout copy', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /prompt craft/i })).toBeInTheDocument();
    expect(screen.getByText(/Transform your basic ideas/i)).toBeInTheDocument();
  });

  it('enables generation button after typing input', async () => {
    const user = userEvent.setup();
    render(<App />);

    const textarea = screen.getByRole('textbox', { name: /prompt input/i });
    const generateButton = screen.getByRole('button', { name: /generate prompt/i });

    expect(generateButton).toBeDisabled();

    await user.type(textarea, 'Create a blog post about accessibility best practices.');

    expect(generateButton).not.toBeDisabled();
  });
});
