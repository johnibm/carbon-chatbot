# 📖 Carbon Chatbot (IBM Carbon Design + OpenShift)

This is a simple chatbot UI built with IBM's Carbon Design System, deployed easily to OpenShift.

## 🚀 Quick Start

1. **Build your container:**

```bash
podman build -t yourusername/carbon-chatbot:latest .
pdoman push yourusername/carbon-chatbot:latest
```

2. **Deploy to OpenShift:**

```bash
oc apply -f openshift-deploy.yaml
```

3. **Access the chatbot:**

- OpenShift will create a `Route` automatically.
- URL will be something like:
  ```
  https://carbon-chatbot-route.apps.your-cluster.example.com
  ```

4. **Enjoy your chatbot!** 🎉

---

✅ Built with:
- React 18
- IBM Carbon Design System
- React Markdown
- OpenShift Kubernetes
