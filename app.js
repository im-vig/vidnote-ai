const $ = (id) => document.getElementById(id);

const video = $("video");
const state = {
  videos: [],
  currentIndex: -1,
  cues: [],
  subtitleOffset: 0,
  settings: {
    chatApiBaseUrl: "",
    chatApiKey: "",
    chatEndpoint: "/v1/chat/completions",
    transcriptionApiBaseUrl: "",
    transcriptionApiKey: "",
    transcriptionEndpoint: "/v1/audio/transcriptions",
    chatModel: "gpt-4.1-mini",
    transcriptionModel: "whisper-1",
    subtitleLanguage: "zh",
  },
};

const dom = {
  currentTitle: $("currentTitle"),
  videoInput: $("videoInput"),
  heroVideoInput: $("heroVideoInput"),
  playlistInput: $("playlistInput"),
  dropZone: $("dropZone"),
  emptyState: $("emptyState"),
  playlist: $("playlist"),
  currentTime: $("currentTime"),
  duration: $("duration"),
  seekRange: $("seekRange"),
  playButton: $("playButton"),
  previousButton: $("previousButton"),
  nextButton: $("nextButton"),
  backwardButton: $("backwardButton"),
  forwardButton: $("forwardButton"),
  speedRange: $("speedRange"),
  speedDown: $("speedDown"),
  speedUp: $("speedUp"),
  speedValue: $("speedValue"),
  frameBack: $("frameBack"),
  frameForward: $("frameForward"),
  loopButton: $("loopButton"),
  muteButton: $("muteButton"),
  volumeRange: $("volumeRange"),
  fullscreenButton: $("fullscreenButton"),
  pipButton: $("pipButton"),
  aiSubtitleQuick: $("aiSubtitleQuick"),
  summaryQuick: $("summaryQuick"),
  bookmarkButton: $("bookmarkButton"),
  clearMarks: $("clearMarks"),
  marksList: $("marksList"),
  metaSize: $("metaSize"),
  metaDuration: $("metaDuration"),
  metaResolution: $("metaResolution"),
  metaRate: $("metaRate"),
  subtitleInput: $("subtitleInput"),
  subtitleToggle: $("subtitleToggle"),
  subtitleOverlay: $("subtitleOverlay"),
  subtitleOffset: $("subtitleOffset"),
  offsetDown: $("offsetDown"),
  offsetUp: $("offsetUp"),
  offsetValue: $("offsetValue"),
  generateSubtitle: $("generateSubtitle"),
  transcriptBox: $("transcriptBox"),
  subtitleList: $("subtitleList"),
  downloadVtt: $("downloadVtt"),
  generateSummary: $("generateSummary"),
  generateChapters: $("generateChapters"),
  summaryStatus: $("summaryStatus"),
  summaryOutput: $("summaryOutput"),
  copySummary: $("copySummary"),
  saveSettings: $("saveSettings"),
  settingsStatus: $("settingsStatus"),
  chatApiBaseUrl: $("chatApiBaseUrl"),
  chatApiKey: $("chatApiKey"),
  chatEndpoint: $("chatEndpoint"),
  transcriptionApiBaseUrl: $("transcriptionApiBaseUrl"),
  transcriptionApiKey: $("transcriptionApiKey"),
  transcriptionEndpoint: $("transcriptionEndpoint"),
  chatModel: $("chatModel"),
  transcriptionModel: $("transcriptionModel"),
  subtitleLanguage: $("subtitleLanguage"),
};

const storageKey = "ai-video-player-settings";

function currentItem() {
  return state.videos[state.currentIndex] || null;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function oneDecimal(value) {
  return Math.round(Number(value) * 10) / 10;
}

function formatTime(seconds = 0) {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function formatSize(bytes = 0) {
  if (!bytes) return "--";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function setStatus(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle("error", isError);
}

function selectTab(name) {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === name);
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `tab-${name}`);
  });
}

function getSettingsFromForm() {
  return {
    chatApiBaseUrl: dom.chatApiBaseUrl.value.trim(),
    chatApiKey: dom.chatApiKey.value.trim(),
    chatEndpoint: dom.chatEndpoint.value.trim() || "/v1/chat/completions",
    transcriptionApiBaseUrl: dom.transcriptionApiBaseUrl.value.trim(),
    transcriptionApiKey: dom.transcriptionApiKey.value.trim(),
    transcriptionEndpoint:
      dom.transcriptionEndpoint.value.trim() || "/v1/audio/transcriptions",
    chatModel: dom.chatModel.value.trim() || "gpt-4.1-mini",
    transcriptionModel: dom.transcriptionModel.value.trim() || "whisper-1",
    subtitleLanguage: dom.subtitleLanguage.value.trim() || "zh",
  };
}

function fillSettingsForm() {
  dom.chatApiBaseUrl.value = state.settings.chatApiBaseUrl;
  dom.chatApiKey.value = state.settings.chatApiKey;
  dom.chatEndpoint.value = state.settings.chatEndpoint;
  dom.transcriptionApiBaseUrl.value = state.settings.transcriptionApiBaseUrl;
  dom.transcriptionApiKey.value = state.settings.transcriptionApiKey;
  dom.transcriptionEndpoint.value = state.settings.transcriptionEndpoint;
  dom.chatModel.value = state.settings.chatModel;
  dom.transcriptionModel.value = state.settings.transcriptionModel;
  dom.subtitleLanguage.value = state.settings.subtitleLanguage;
}

function normalizeSavedSettings(saved) {
  const migrated = { ...saved };
  if (saved.apiBaseUrl && !saved.chatApiBaseUrl) {
    migrated.chatApiBaseUrl = saved.apiBaseUrl;
  }
  if (saved.apiKey && !saved.chatApiKey) {
    migrated.chatApiKey = saved.apiKey;
  }
  if (saved.apiBaseUrl && !saved.transcriptionApiBaseUrl) {
    migrated.transcriptionApiBaseUrl = saved.apiBaseUrl;
  }
  if (saved.apiKey && !saved.transcriptionApiKey) {
    migrated.transcriptionApiKey = saved.apiKey;
  }
  delete migrated.apiBaseUrl;
  delete migrated.apiKey;
  return migrated;
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    state.settings = { ...state.settings, ...normalizeSavedSettings(saved) };
  } catch {
    localStorage.removeItem(storageKey);
  }
  fillSettingsForm();
}

function saveSettings() {
  state.settings = getSettingsFromForm();
  localStorage.setItem(storageKey, JSON.stringify(state.settings));
  setStatus(dom.settingsStatus, "已保存到本机浏览器");
}

function requireApiSettings(kind) {
  state.settings = getSettingsFromForm();
  const isChat = kind === "chat";
  const baseUrl = isChat ? state.settings.chatApiBaseUrl : state.settings.transcriptionApiBaseUrl;
  if (!baseUrl) {
    selectTab("settings");
    setStatus(dom.settingsStatus, `请先填写${isChat ? "总结" : "字幕"} API 的 Base URL`, true);
    throw new Error("缺少 API Base URL");
  }
  saveSettings();
  return state.settings;
}

function buildApiUrl(baseUrl, endpoint) {
  const base = baseUrl.replace(/\/+$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}

async function handleVideoFiles(fileList) {
  const files = [...fileList].filter((file) => file.type.startsWith("video/"));
  if (!files.length) return;

  const firstNewIndex = state.videos.length;
  files.forEach((file) => {
    state.videos.push({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      duration: 0,
      width: 0,
      height: 0,
      thumbnail: "",
      cues: [],
      transcript: "",
      summary: "",
      marks: [],
    });
  });

  renderPlaylist();
  if (state.currentIndex === -1) {
    selectVideo(firstNewIndex);
  }

  state.videos.slice(firstNewIndex).forEach((item) => enrichVideoItem(item));
}

function selectVideo(index) {
  const item = state.videos[index];
  if (!item) return;

  state.currentIndex = index;
  video.src = item.url;
  video.load();
  dom.emptyState.classList.add("hidden");
  dom.currentTitle.textContent = item.name;
  state.cues = item.cues || [];
  dom.transcriptBox.value = item.transcript || "";
  dom.summaryOutput.textContent = item.summary || "";
  state.subtitleOffset = item.subtitleOffset || 0;
  updateOffsetView();
  updateMeta();
  renderPlaylist();
  renderCues();
  renderMarks();
  updateSubtitleOverlay();
}

function updateMeta() {
  const item = currentItem();
  dom.metaSize.textContent = item ? formatSize(item.size) : "--";
  dom.metaDuration.textContent = item?.duration ? formatTime(item.duration) : "--";
  dom.metaResolution.textContent =
    item?.width && item?.height ? `${item.width} × ${item.height}` : "--";
  dom.metaRate.textContent = `${video.playbackRate.toFixed(1)}x`;
}

function renderPlaylist() {
  dom.playlist.innerHTML = "";
  const template = $("playlistItemTemplate");
  state.videos.forEach((item, index) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.classList.toggle("active", index === state.currentIndex);
    node.querySelector("strong").textContent = item.name;
    node.querySelector("small").textContent = `${formatSize(item.size)} · ${
      item.duration ? formatTime(item.duration) : "读取中"
    }`;
    const thumb = node.querySelector(".thumb");
    if (item.thumbnail) {
      const img = document.createElement("img");
      img.alt = "";
      img.src = item.thumbnail;
      thumb.textContent = "";
      thumb.appendChild(img);
    } else {
      thumb.textContent = item.file.name.split(".").pop()?.toUpperCase() || "VIDEO";
    }
    node.addEventListener("click", () => selectVideo(index));
    dom.playlist.appendChild(node);
  });
}

function enrichVideoItem(item) {
  const probe = document.createElement("video");
  probe.preload = "metadata";
  probe.muted = true;
  probe.playsInline = true;
  probe.src = item.url;

  probe.addEventListener(
    "loadedmetadata",
    () => {
      item.duration = probe.duration || 0;
      item.width = probe.videoWidth || 0;
      item.height = probe.videoHeight || 0;
      if (item.duration > 0) {
        probe.currentTime = Math.min(1, item.duration / 4);
      }
      if (item === currentItem()) {
        updateMeta();
        dom.duration.textContent = formatTime(video.duration || item.duration);
      }
      renderPlaylist();
    },
    { once: true },
  );

  probe.addEventListener(
    "seeked",
    () => {
      try {
        const canvas = document.createElement("canvas");
        const scale = 172 / Math.max(1, probe.videoWidth);
        canvas.width = 172;
        canvas.height = Math.max(96, Math.round(probe.videoHeight * scale));
        const ctx = canvas.getContext("2d");
        ctx.drawImage(probe, 0, 0, canvas.width, canvas.height);
        item.thumbnail = canvas.toDataURL("image/jpeg", 0.72);
        renderPlaylist();
      } catch {
        item.thumbnail = "";
      }
      probe.removeAttribute("src");
      probe.load();
    },
    { once: true },
  );
}

function updateTimeline() {
  const duration = video.duration || 0;
  const current = video.currentTime || 0;
  dom.currentTime.textContent = formatTime(current);
  dom.duration.textContent = formatTime(duration);
  dom.seekRange.value = duration ? String((current / duration) * 1000) : "0";
  updateSubtitleOverlay();
}

function setSpeed(value) {
  const rate = oneDecimal(clamp(value, 0.1, 4));
  video.playbackRate = rate;
  dom.speedRange.value = String(rate);
  dom.speedValue.value = `${rate.toFixed(1)}x`;
  dom.speedValue.textContent = `${rate.toFixed(1)}x`;
  dom.metaRate.textContent = `${rate.toFixed(1)}x`;
  document.querySelectorAll(".speed-presets button").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.speed) === rate);
  });
}

function togglePlay() {
  if (!currentItem()) {
    dom.videoInput.click();
    return;
  }
  if (video.paused) {
    video.play().catch(() => {});
  } else {
    video.pause();
  }
}

function seekBy(seconds) {
  if (!Number.isFinite(video.duration)) return;
  video.currentTime = clamp(video.currentTime + seconds, 0, video.duration);
}

function stepFrame(direction) {
  if (!currentItem()) return;
  video.pause();
  seekBy(direction * (1 / 30));
}

function toggleLoop() {
  video.loop = !video.loop;
  dom.loopButton.classList.toggle("active", video.loop);
}

function updateMuteView() {
  dom.muteButton.textContent = video.muted || video.volume === 0 ? "🔇" : "🔊";
}

async function togglePictureInPicture() {
  if (!currentItem() || !document.pictureInPictureEnabled) return;
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      await video.requestPictureInPicture();
    }
  } catch {
    setStatus(dom.summaryStatus, "当前浏览器不允许画中画", true);
  }
}

async function toggleFullscreen() {
  const target = dom.dropZone;
  if (document.fullscreenElement) {
    await document.exitFullscreen();
  } else {
    await target.requestFullscreen();
  }
}

function addBookmark() {
  const item = currentItem();
  if (!item) return;
  item.marks.push({
    time: video.currentTime || 0,
    label: `标记 ${item.marks.length + 1}`,
  });
  renderMarks();
}

function renderMarks() {
  const item = currentItem();
  dom.marksList.innerHTML = "";
  (item?.marks || []).forEach((mark, index) => {
    const row = document.createElement("div");
    row.className = "mark-row";

    const jumpButton = document.createElement("button");
    jumpButton.className = "mark-item";
    jumpButton.type = "button";
    jumpButton.innerHTML = `<span>${formatTime(mark.time)}</span><strong>${mark.label}</strong>`;
    jumpButton.addEventListener("click", () => {
      video.currentTime = mark.time;
      video.play().catch(() => {});
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "mark-delete";
    deleteButton.type = "button";
    deleteButton.title = "删除这一条标记";
    deleteButton.setAttribute("aria-label", `删除标记 ${formatTime(mark.time)}`);
    deleteButton.textContent = "🗑";
    deleteButton.addEventListener("click", () => {
      item.marks.splice(index, 1);
      renderMarks();
    });

    row.append(jumpButton, deleteButton);
    dom.marksList.appendChild(row);
  });
}

function parseTimestamp(raw) {
  const normalized = raw.trim().replace(",", ".");
  const parts = normalized.split(":").map(Number);
  if (parts.some(Number.isNaN)) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

function parseSubtitle(text) {
  const blocks = text
    .replace(/\r/g, "")
    .replace(/^WEBVTT[^\n]*\n+/i, "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const cues = [];
  blocks.forEach((block) => {
    const lines = block.split("\n").filter(Boolean);
    const timeIndex = lines.findIndex((line) => line.includes("-->"));
    if (timeIndex === -1) return;
    const [startRaw, endRaw] = lines[timeIndex].split("-->");
    const textLines = lines.slice(timeIndex + 1);
    const endClean = endRaw.trim().split(/\s+/)[0];
    cues.push({
      start: parseTimestamp(startRaw),
      end: parseTimestamp(endClean),
      text: textLines.join("\n").trim(),
    });
  });
  return cues.filter((cue) => cue.text && cue.end > cue.start);
}

function formatVttTimestamp(seconds) {
  const value = Math.max(0, seconds || 0);
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const secs = Math.floor(value % 60);
  const ms = Math.round((value - Math.floor(value)) * 1000);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

function cuesToVtt(cues) {
  const body = cues
    .map(
      (cue, index) =>
        `${index + 1}\n${formatVttTimestamp(cue.start)} --> ${formatVttTimestamp(cue.end)}\n${cue.text}`,
    )
    .join("\n\n");
  return `WEBVTT\n\n${body}\n`;
}

function cuesFromPlainText(text, duration) {
  const pieces = text
    .replace(/\s+/g, " ")
    .split(/(?<=[。！？!?；;])\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
  const chunks = pieces.length ? pieces : [text.trim()].filter(Boolean);
  if (!chunks.length) return [];
  const slot = Math.max(2, (duration || chunks.length * 6) / chunks.length);
  return chunks.map((chunk, index) => ({
    start: index * slot,
    end: Math.min((index + 1) * slot, duration || (index + 1) * slot),
    text: chunk,
  }));
}

function setCues(cues, transcript) {
  const item = currentItem();
  state.cues = cues;
  if (item) {
    item.cues = cues;
    item.transcript = transcript;
    item.subtitleOffset = state.subtitleOffset;
  }
  dom.transcriptBox.value = transcript;
  renderCues();
  updateSubtitleOverlay();
}

function renderCues() {
  dom.subtitleList.innerHTML = "";
  state.cues.forEach((cue) => {
    const button = document.createElement("button");
    button.className = "cue-item";
    button.type = "button";
    button.innerHTML = `<span>${formatTime(cue.start)}</span><strong>${escapeHtml(cue.text)}</strong>`;
    button.addEventListener("click", () => {
      video.currentTime = cue.start;
      video.play().catch(() => {});
    });
    dom.subtitleList.appendChild(button);
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function updateSubtitleOverlay() {
  if (!dom.subtitleToggle.checked || !state.cues.length) {
    dom.subtitleOverlay.hidden = true;
    return;
  }
  const now = (video.currentTime || 0) + state.subtitleOffset;
  const cue = state.cues.find((item) => now >= item.start && now <= item.end);
  if (!cue) {
    dom.subtitleOverlay.hidden = true;
    return;
  }
  dom.subtitleOverlay.hidden = false;
  dom.subtitleOverlay.textContent = cue.text;
}

function updateOffsetView() {
  dom.offsetValue.value = `${state.subtitleOffset.toFixed(1)}s`;
  dom.offsetValue.textContent = `${state.subtitleOffset.toFixed(1)}s`;
}

function shiftSubtitleOffset(delta) {
  state.subtitleOffset = oneDecimal(state.subtitleOffset + delta);
  const item = currentItem();
  if (item) item.subtitleOffset = state.subtitleOffset;
  updateOffsetView();
  updateSubtitleOverlay();
}

async function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, "utf-8");
  });
}

async function importSubtitleFile(file) {
  if (!file) return;
  const text = await readTextFile(file);
  const cues = parseSubtitle(text);
  const transcript = cues.map((cue) => cue.text).join("\n");
  setCues(cues, transcript);
}

function normalizeTranscriptionResult(data, duration) {
  if (typeof data === "string") {
    const parsed = parseSubtitle(data);
    if (parsed.length) {
      return {
        cues: parsed,
        transcript: parsed.map((cue) => cue.text).join("\n"),
      };
    }
    return {
      cues: cuesFromPlainText(data, duration),
      transcript: data.trim(),
    };
  }

  const segmentSource = data.segments || data.chunks || data.transcription?.segments;
  if (Array.isArray(segmentSource) && segmentSource.length) {
    const cues = segmentSource
      .map((segment) => {
        const timestamp = segment.timestamp || segment.timestamps || [];
        return {
          start: Number(segment.start ?? timestamp[0] ?? 0),
          end: Number(segment.end ?? timestamp[1] ?? 0),
          text: String(segment.text || segment.chunk || "").trim(),
        };
      })
      .filter((cue) => cue.text && cue.end > cue.start);
    if (cues.length) {
      return {
        cues,
        transcript: data.text || cues.map((cue) => cue.text).join("\n"),
      };
    }
  }

  const text =
    data.text ||
    data.transcript ||
    data.output_text ||
    data.result ||
    JSON.stringify(data, null, 2);
  return {
    cues: cuesFromPlainText(String(text), duration),
    transcript: String(text).trim(),
  };
}

async function generateAiSubtitles() {
  const item = currentItem();
  if (!item) {
    dom.videoInput.click();
    return;
  }

  let settings;
  try {
    settings = requireApiSettings("transcription");
  } catch (error) {
    return;
  }

  dom.generateSubtitle.classList.add("is-busy");
  dom.generateSubtitle.textContent = "生成中...";
  setStatus(dom.settingsStatus, "");

  try {
    const formData = new FormData();
    formData.append("file", item.file, item.file.name);
    formData.append("model", settings.transcriptionModel);
    formData.append("response_format", "verbose_json");
    if (settings.subtitleLanguage) formData.append("language", settings.subtitleLanguage);

    const headers = {};
    if (settings.transcriptionApiKey) {
      headers.Authorization = `Bearer ${settings.transcriptionApiKey}`;
    }

    const response = await fetch(
      buildApiUrl(settings.transcriptionApiBaseUrl, settings.transcriptionEndpoint),
      {
        method: "POST",
        headers,
        body: formData,
      },
    );

    const payloadText = await response.text();
    if (!response.ok) throw new Error(payloadText || response.statusText);

    let payload = payloadText;
    try {
      payload = JSON.parse(payloadText);
    } catch {
      payload = payloadText;
    }

    const result = normalizeTranscriptionResult(payload, video.duration || item.duration);
    setCues(result.cues, result.transcript);
    selectTab("subtitles");
    setStatus(dom.settingsStatus, "AI 字幕已生成");
  } catch (error) {
    selectTab("settings");
    setStatus(dom.settingsStatus, `字幕生成失败：${error.message}`, true);
  } finally {
    dom.generateSubtitle.classList.remove("is-busy");
    dom.generateSubtitle.textContent = "生成 AI 字幕";
  }
}

function buildSummaryPrompt(mode, transcript, item) {
  const title = item?.name || "未命名视频";
  const duration = formatTime(video.duration || item?.duration || 0);
  if (mode === "chapters") {
    return `视频标题：${title}
视频时长：${duration}
转写文本：
${transcript}

请基于转写文本生成中文章节大纲。每个章节包含：时间范围估计、章节标题、2-3 个关键点。输出要紧凑清晰。`;
  }

  return `视频标题：${title}
视频时长：${duration}
转写文本：
${transcript}

请生成中文视频要点总结，包含：一句话概览、5-8 条核心要点、关键术语、复习建议。`;
}

async function callChatCompletion(mode) {
  const item = currentItem();
  const transcript = dom.transcriptBox.value.trim();
  if (!transcript) {
    selectTab("subtitles");
    setStatus(dom.summaryStatus, "请先生成或粘贴字幕文本", true);
    return;
  }

  let settings;
  try {
    settings = requireApiSettings("chat");
  } catch (error) {
    return;
  }

  const button = mode === "chapters" ? dom.generateChapters : dom.generateSummary;
  button.classList.add("is-busy");
  button.textContent = mode === "chapters" ? "生成中..." : "总结中...";
  setStatus(dom.summaryStatus, "正在请求 AI");

  try {
    const headers = {
      "Content-Type": "application/json",
    };
    if (settings.chatApiKey) headers.Authorization = `Bearer ${settings.chatApiKey}`;

    const response = await fetch(buildApiUrl(settings.chatApiBaseUrl, settings.chatEndpoint), {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: settings.chatModel,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "你是一个严谨的视频学习助手，只基于用户提供的转写文本进行分析，输出中文。",
          },
          {
            role: "user",
            content: buildSummaryPrompt(mode, transcript, item),
          },
        ],
      }),
    });

    const payloadText = await response.text();
    if (!response.ok) throw new Error(payloadText || response.statusText);

    let payload = {};
    try {
      payload = JSON.parse(payloadText);
    } catch {
      payload = { text: payloadText };
    }

    const content =
      payload.choices?.[0]?.message?.content ||
      payload.output_text ||
      payload.text ||
      payload.content ||
      JSON.stringify(payload, null, 2);

    dom.summaryOutput.textContent = content.trim();
    if (item) item.summary = dom.summaryOutput.textContent;
    selectTab("summary");
    setStatus(dom.summaryStatus, "已完成");
  } catch (error) {
    selectTab("settings");
    setStatus(dom.settingsStatus, `AI 总结失败：${error.message}`, true);
  } finally {
    button.classList.remove("is-busy");
    button.textContent = mode === "chapters" ? "生成章节大纲" : "生成要点总结";
  }
}

function downloadCurrentVtt() {
  if (!state.cues.length) return;
  const blob = new Blob([cuesToVtt(state.cues)], { type: "text/vtt;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${(currentItem()?.name || "subtitles").replace(/\.[^.]+$/, "")}.vtt`;
  link.click();
  URL.revokeObjectURL(url);
}

function bindEvents() {
  [dom.videoInput, dom.heroVideoInput, dom.playlistInput].forEach((input) => {
    input.addEventListener("change", (event) => handleVideoFiles(event.target.files));
  });

  dom.dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dom.dropZone.classList.add("dragover");
  });
  dom.dropZone.addEventListener("dragleave", () => dom.dropZone.classList.remove("dragover"));
  dom.dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dom.dropZone.classList.remove("dragover");
    handleVideoFiles(event.dataTransfer.files);
  });

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => selectTab(button.dataset.tab));
  });

  video.addEventListener("loadedmetadata", () => {
    const item = currentItem();
    if (item) {
      item.duration = video.duration || item.duration;
      item.width = video.videoWidth || item.width;
      item.height = video.videoHeight || item.height;
    }
    updateMeta();
    updateTimeline();
    renderPlaylist();
  });
  video.addEventListener("timeupdate", updateTimeline);
  video.addEventListener("durationchange", updateTimeline);
  video.addEventListener("play", () => {
    dom.playButton.textContent = "❚❚";
    dom.playButton.title = "暂停";
  });
  video.addEventListener("pause", () => {
    dom.playButton.textContent = "▶";
    dom.playButton.title = "播放";
  });
  video.addEventListener("ended", () => {
    if (!video.loop && state.currentIndex < state.videos.length - 1) {
      selectVideo(state.currentIndex + 1);
      video.play().catch(() => {});
    }
  });

  dom.playButton.addEventListener("click", togglePlay);
  dom.previousButton.addEventListener("click", () => selectVideo(Math.max(0, state.currentIndex - 1)));
  dom.nextButton.addEventListener("click", () =>
    selectVideo(Math.min(state.videos.length - 1, state.currentIndex + 1)),
  );
  dom.backwardButton.addEventListener("click", () => seekBy(-10));
  dom.forwardButton.addEventListener("click", () => seekBy(10));
  dom.frameBack.addEventListener("click", () => stepFrame(-1));
  dom.frameForward.addEventListener("click", () => stepFrame(1));
  dom.loopButton.addEventListener("click", toggleLoop);
  dom.pipButton.addEventListener("click", togglePictureInPicture);
  dom.fullscreenButton.addEventListener("click", toggleFullscreen);
  dom.bookmarkButton.addEventListener("click", addBookmark);
  dom.clearMarks.addEventListener("click", () => {
    const item = currentItem();
    if (item) item.marks = [];
    renderMarks();
  });

  dom.seekRange.addEventListener("input", () => {
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    video.currentTime = (Number(dom.seekRange.value) / 1000) * video.duration;
  });

  dom.speedRange.addEventListener("input", () => setSpeed(dom.speedRange.value));
  dom.speedDown.addEventListener("click", () => setSpeed(video.playbackRate - 0.1));
  dom.speedUp.addEventListener("click", () => setSpeed(video.playbackRate + 0.1));
  document.querySelectorAll(".speed-presets button").forEach((button) => {
    button.addEventListener("click", () => setSpeed(button.dataset.speed));
  });

  dom.volumeRange.addEventListener("input", () => {
    video.volume = Number(dom.volumeRange.value);
    video.muted = video.volume === 0;
    updateMuteView();
  });
  dom.muteButton.addEventListener("click", () => {
    video.muted = !video.muted;
    updateMuteView();
  });

  dom.subtitleInput.addEventListener("change", (event) => importSubtitleFile(event.target.files[0]));
  dom.subtitleToggle.addEventListener("change", updateSubtitleOverlay);
  dom.offsetDown.addEventListener("click", () => shiftSubtitleOffset(-0.1));
  dom.offsetUp.addEventListener("click", () => shiftSubtitleOffset(0.1));
  dom.downloadVtt.addEventListener("click", downloadCurrentVtt);
  dom.transcriptBox.addEventListener("input", () => {
    const item = currentItem();
    if (item) item.transcript = dom.transcriptBox.value;
  });
  dom.generateSubtitle.addEventListener("click", generateAiSubtitles);
  dom.aiSubtitleQuick.addEventListener("click", () => {
    selectTab("subtitles");
    generateAiSubtitles();
  });

  dom.generateSummary.addEventListener("click", () => callChatCompletion("summary"));
  dom.generateChapters.addEventListener("click", () => callChatCompletion("chapters"));
  dom.summaryQuick.addEventListener("click", () => {
    selectTab("summary");
    callChatCompletion("summary");
  });
  dom.copySummary.addEventListener("click", async () => {
    if (!dom.summaryOutput.textContent.trim()) return;
    await navigator.clipboard.writeText(dom.summaryOutput.textContent);
    setStatus(dom.summaryStatus, "已复制");
  });

  dom.saveSettings.addEventListener("click", saveSettings);
  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const typing =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement;
    if (typing) return;
    if (event.code === "Space") {
      event.preventDefault();
      togglePlay();
    }
    if (event.code === "ArrowLeft") seekBy(-5);
    if (event.code === "ArrowRight") seekBy(5);
    if (event.code === "BracketLeft") setSpeed(video.playbackRate - 0.1);
    if (event.code === "BracketRight") setSpeed(video.playbackRate + 0.1);
  });
}

window.addEventListener("beforeunload", () => {
  state.videos.forEach((item) => URL.revokeObjectURL(item.url));
});

loadSettings();
bindEvents();
setSpeed(1);
