import { Header, HeaderName } from 'carbon-components-react';
import 'carbon-components/css/carbon-components.min.css';

export default function FancyStreamingChatbot() {
  return (
    <div>
      <Header aria-label="Carbon Chatbot">
        <HeaderName href="#" prefix="IBM">
          CarbonChat
        </HeaderName>
      </Header>
      <main style={{ padding: '2rem' }}>
        <h1>🚀 Welcome to Carbon Chatbot!</h1>
        <p>Paste the full chatbot code here...</p>
      </main>
    </div>
  );
}
