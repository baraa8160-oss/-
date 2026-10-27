(() => {
  function attachPreview() {
    const button = document.getElementById("qv-record");
    if (!button || button.dataset.previewReady) return;
    button.dataset.previewReady = "1";
    const preview = document.createElement("video");
    preview.id = "qv-live-preview";
    preview.autoplay = true;
    preview.muted = true;
    preview.playsInline = true;
    preview.style.cssText = "display:none;width:100%;max-height:240px;background:#000;border-radius:10px;margin:8px auto";
    button.parentNode.insertBefore(preview, button);
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async function (constraints) {
      const media = await original(constraints);
      preview.srcObject = media;
      preview.style.display = "block";
      preview.play().catch(() => {});
      media.getTracks().forEach(track => track.addEventListener("ended", () => {
        preview.srcObject = null;
        preview.style.display = "none";
      }));
      return media;
    };
  }
  const timer = setInterval(() => {
    attachPreview();
    if (document.getElementById("qv-live-preview")) clearInterval(timer);
  }, 300);
})();