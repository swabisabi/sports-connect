import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "tools"))

from make_qr import make_qr  # noqa: E402


def test_writes_svg_file(tmp_path):
    out = tmp_path / "qr.svg"
    make_qr("https://chat.whatsapp.com/EXAMPLE", str(out))
    text = out.read_text(encoding="utf-8")
    assert out.stat().st_size > 0
    assert text.lstrip().startswith(("<?xml", "<svg"))


def test_rejects_non_http_url(tmp_path):
    with pytest.raises(ValueError):
        make_qr("hello", str(tmp_path / "qr.svg"))
