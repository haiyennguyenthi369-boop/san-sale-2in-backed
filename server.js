import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

const PORT = process.env.PORT || 3001;

const API_KEY = process.env.AFFIPAD_API_KEY;
const TOOL_ID = process.env.AFFIPAD_TOOL_ID;

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "SĂN SALE CÙNG 2IN backend đang chạy",
  });
});

app.post("/api/convert", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        error: "Bạn chưa nhập link Shopee.",
      });
    }

    if (!API_KEY) {
      return res.status(500).json({
        error: "Chưa cấu hình AFFIPAD_API_KEY.",
      });
    }

    if (!TOOL_ID) {
      return res.status(500).json({
        error: "Chưa cấu hình AFFIPAD_TOOL_ID.",
      });
    }

   const response = await fetch("https://api.affipad.com/v1/convert", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        toolId: TOOL_ID,
        url: url,
      }),
    });

const text = await response.text();

console.log("AffiPad status:", response.status);
console.log("AffiPad response:", text);

let data;

try {
  data = JSON.parse(text);
} catch {
  return res.status(502).json({
    error: "AffiPad không trả về JSON.",
    detail: text.slice(0, 500),
  });
}
    console.log("AffiPad response:", data);

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.message || data?.error || "AffiPad API báo lỗi.",
        detail: data,
      });
    }

    const affiliateUrl =
  data?.data?.results?.[0]?.link ||
  data?.data?.results?.[0]?.shortUrl;

    if (!affiliateUrl) {
      return res.status(500).json({
        error: "API không trả về affiliate URL.",
        detail: data,
      });
    }

    res.json({
      affiliateUrl,
    });
  } catch (error) {
    console.error("SERVER ERROR:", error);

    res.status(500).json({
      error: "Có lỗi xảy ra ở server.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`SĂN SALE CÙNG 2IN backend chạy tại http://localhost:${PORT}`);
});
