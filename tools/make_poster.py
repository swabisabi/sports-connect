"""Build the A4 poster PDF: python tools/make_poster.py ops/poster.pdf"""
import io
import sys

import segno
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

HUB_URL = "https://swabisabi.github.io/sports-connect/"
COMMUNITY_URL = "https://chat.whatsapp.com/GBKD57Plcsb9M5Ggtrl9vA"
GREEN = HexColor("#1a7f4b")


def qr_image(url: str) -> ImageReader:
    buf = io.BytesIO()
    segno.make(url, error="m").save(buf, kind="png", scale=20, border=4)
    buf.seek(0)
    return ImageReader(buf)


def build(out_path: str) -> None:
    w, h = A4
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setFillColor(GREEN)
    c.rect(0, h - 230, w, 230, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 44)
    c.drawCentredString(w / 2, h - 105, "New in town?")
    c.drawCentredString(w / 2, h - 160, "Find your team.")

    c.setFillColor(HexColor("#222222"))
    c.setFont("Helvetica-Bold", 26)
    c.drawCentredString(w / 2, h - 290, "Eldoret: scan to join your WhatsApp group")
    size = 270
    c.drawImage(qr_image(HUB_URL), (w - size) / 2, h - 290 - 15 - size, size, size)

    c.setFont("Helvetica", 18)
    c.drawCentredString(w / 2, 232, "Basketball  ·  Football  ·  Running  ·  Table Tennis  ·  Badminton")
    c.setFont("Helvetica", 15)
    c.drawCentredString(w / 2, 207, "Say hi and tell us your name, age group and sports.")

    c.setFont("Helvetica-Bold", 15)
    c.drawCentredString(w / 2, 184, "First Game Pass, KSh 200: a session within 7 days or your money back")

    c.setFillColor(GREEN)
    c.roundRect(60, 70, w - 120, 90, 12, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(w / 2, 130, "Sports Connect")
    c.setFont("Helvetica", 13)
    c.drawCentredString(w / 2, 105, "Or join the community: " + COMMUNITY_URL.replace("https://", ""))
    c.drawCentredString(w / 2, 85, HUB_URL.replace("https://", ""))
    c.setFillColor(HexColor("#555555"))
    c.setFont("Helvetica", 12)
    c.drawCentredString(w / 2, 40, "Founding sponsor space: open")
    c.showPage()
    c.save()


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else "ops/poster.pdf")
