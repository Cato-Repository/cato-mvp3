import { createVertex } from "@ai-sdk/google-vertex";

// Service account keys are often stored with literal "\n" sequences
// (e.g. copied from the JSON key file or passed through a shell), which
// need to become real newlines for PEM parsing to succeed.
function normalizePrivateKey(key: string | undefined) {
  return key?.replace(/\\n/g, "\n");
}

export const vertex = createVertex({
  project: process.env.GOOGLE_VERTEX_PROJECT,
  location: process.env.GOOGLE_VERTEX_LOCATION,
  googleAuthOptions: {
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: normalizePrivateKey(process.env.GOOGLE_PRIVATE_KEY),
    },
  },
});

export const GEMINI_MODEL = "gemini-2.5-flash";
