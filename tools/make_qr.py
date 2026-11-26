"""Write a QR code SVG for a URL: python tools/make_qr.py <url> <out.svg>"""
import argparse

import segno


def make_qr(url: str, out_path: str, scale: int = 10) -> None:
    if not url.startswith(("http://", "https://")):
        raise ValueError("url must start with http:// or https://")
    segno.make(url, error="m").save(out_path, scale=scale)


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("url")
    ap.add_argument("out_path")
    args = ap.parse_args(argv)
    make_qr(args.url, args.out_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
