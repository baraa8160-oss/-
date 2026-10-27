(() => {
  const box = document.getElementById("video-content");
  if (!box) return;

  box.innerHTML = `
    <div style="padding:10px;text-align:center;color:#075b3b">
      <p>شارك فيديو لقجال (20 ثانية كحد أقصى)</p>
      <button id="qv-admin-login" type="button" style="display:block;margin:8px auto;background:#075b3b;color:white;border:0;border-radius:8px;padding:8px">🔐 دخول المدير</button>
      <p id="qv-admin-status" style="font-size:12px"></p>
      <button id="qv-record" type="button">📹 تصوير فيديو</button>
      <button id="qv-stop" type="button" disabled>⏹ إيقاف ورفع</button>
      <label style="display:block;margin:8px">
        أو اختر فيديو من الهاتف
        <input id="qv-file" type="file" accept="video/*" style="display:block;margin:8px auto;max-width:100%">
      </label>
      <p id="qv-status" role="status">الفيديوهات المنشورة ستظهر هنا.</p>
      <div id="qv-feed"></div>
    </div>`;

  const status = document.getElementById("qv-status");
  const feed = document.getElementById("qv-feed");
  const adminStatus = document.getElementById("qv-admin-status");
  const adminEmail = "baraa8160@gmail.com";
  let isAdmin = false;
  const say = t => { status.textContent = t; };
  const cloudName = "wiq0fgyr";
  const preset = "qejal_visitor_videos";
  let recorder, stream, chunks = [], timer;

  function addVideo(docId, url) {
    if (!url || !url.includes("res.cloudinary.com")) return;
    const card = document.createElement("div");
    card.style.cssText = "margin:12px auto;padding:8px;border:1px solid #ddd;border-radius:10px";
    const v = document.createElement("video");
    v.src = url; v.controls = true; v.playsInline = true; v.preload = "metadata";
    v.style.cssText = "display:block;width:100%;max-height:280px;border-radius:10px;background:#000";
    card.appendChild(v);
    if (isAdmin) {
      const del = document.createElement("button");
      del.type = "button"; del.textContent = "🗑️ حذف الفيديو";
      del.style.cssText = "display:block;margin:8px auto;background:#b42318;color:white;border:0;border-radius:8px;padding:9px";
      del.addEventListener("click", async () => {
        if (!confirm("هل تريد حذف هذا الفيديو من الموقع؟ سيبقى الملف الأصلي في Cloudinary.")) return;
        try { await firebase.firestore().collection("videos").doc(docId).delete(); }
        catch (e) { alert("تعذر الحذف. تحقق من قواعد أمان Firebase."); }
      });
      card.appendChild(del);
    }
    feed.appendChild(card);
  }

  async function durationOf(file) {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const url = URL.createObjectURL(file);
      video.preload = "metadata";
      video.onloadedmetadata = () => { const d = video.duration; URL.revokeObjectURL(url); resolve(d); };
      video.onerror = () => { URL.revokeObjectURL(url); reject(new Error("تعذر قراءة مدة الفيديو؛ جرّب ملف MP4.")); };
      video.src = url;
    });
  }

  async function upload(file) {
    if (!file || !file.type.startsWith("video/")) return say("اختر ملف فيديو صالحًا.");
    if (file.size > 50 * 1024 * 1024) return say("حجم الفيديو أكبر من 50 ميغابايت.");
    say("جارٍ فحص الفيديو...");
    try {
      const duration = await durationOf(file);
      if (!Number.isFinite(duration) || duration > 20.5) return say("يجب ألا تتجاوز مدة الفيديو 20 ثانية.");
    } catch (e) { return say(e.message); }

    say("جارٍ رفع الفيديو، انتظر...");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", preset);
      const response = await fetch("https://api.cloudinary.com/v1_1/" + cloudName + "/video/upload", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok || !data.secure_url) throw new Error(data.error?.message || "فشل رفع الفيديو.");
      const db = firebase.firestore();
      await db.collection("videos").add({
        videoUrl: data.secure_url,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      say("تم نشر الفيديو بنجاح 🇩🇿");
    } catch (e) { say("تعذر النشر: " + (e.message || "تحقق من الاتصال والإعدادات.")); }
  }

  document.getElementById("qv-file").addEventListener("change", e => {
    if (e.target.files && e.target.files[0]) upload(e.target.files[0]);
    e.target.value = "";
  });

  document.getElementById("qv-record").addEventListener("click", async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        say("التصوير المباشر غير مدعوم في هذا المتصفح؛ اختر فيديو من الهاتف.");
        return;
      }
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
      chunks = [];
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
      recorder.onstop = async () => {
        clearTimeout(timer);
        const blob = new Blob(chunks, { type: recorder.mimeType || "video/webm" });
        stream.getTracks().forEach(t => t.stop());
        stream = null;
        document.getElementById("qv-record").disabled = false;
        document.getElementById("qv-stop").disabled = true;
        await upload(new File([blob], "qejal-video.webm", { type: blob.type }));
      };
      recorder.start();
      document.getElementById("qv-record").disabled = true;
      document.getElementById("qv-stop").disabled = false;
      say("التصوير بدأ. سيتوقف تلقائيًا بعد 20 ثانية.");
      timer = setTimeout(() => { if (recorder && recorder.state !== "inactive") recorder.stop(); }, 20000);
    } catch (e) { say("لم نتمكن من فتح الكاميرا. اسمح للموقع باستخدام الكاميرا والميكروفون."); }
  });

  document.getElementById("qv-stop").addEventListener("click", () => {
    if (recorder && recorder.state !== "inactive") recorder.stop();
  });

  if (window.firebase && firebase.apps && firebase.apps.length) {
    const auth = firebase.auth();
    document.getElementById("qv-admin-login").addEventListener("click", async () => {
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
      } catch (e) { adminStatus.textContent = "تعذر تسجيل الدخول. جرّب فتح الموقع في Chrome."; }
    });
    auth.onAuthStateChanged(user => {
      isAdmin = !!(user && user.email && user.email.toLowerCase() === adminEmail);
      adminStatus.textContent = isAdmin ? "تم تسجيل دخول المدير." : (user ? "هذا الحساب ليس حساب المدير." : "إدارة الفيديوهات متاحة للمدير فقط.");
      const db = firebase.firestore();
      db.collection("videos").orderBy("createdAt", "desc").limit(12).onSnapshot(snapshot => {
        feed.innerHTML = "";
        snapshot.forEach(doc => addVideo(doc.id, doc.data().videoUrl));
        if (!feed.children.length) say("لا توجد فيديوهات منشورة بعد. كن أول من يشارك!");
      }, () => say("تعذر تحميل الفيديوهات. تحقق من إعدادات Firebase."));
    });
  } else {
    say("لم يتم تحميل Firebase بعد. يرجى تحديث إعداد الموقع.");
  }
})();