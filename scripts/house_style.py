"""The house annotation colours, in one place.

Deliberately dependency-free (no PIL, no third-party imports) so that anything
can read it: the annotators, the QA gate, and a test that has no business
loading an imaging library.

Why this module exists
----------------------
Two annotators disagreed on the house red. `annotate_screenshot.py` used
(207, 38, 38) and documented it as #CF2626; `screenshot-annotator/annotate_lib.py`
used (206, 38, 38), which is #CE2626. One unit on the red channel is invisible
to a person and permanent in the file, so nothing would ever have reported it -
two images annotated by the two tools were simply never quite the same red.

That is the class of defect a constant defined twice always produces, so the
fix is not to correct the number in both places but to remove the second
definition. `monthly-blog-qa.test.py` asserts that no annotator re-declares a
red of its own, which is what stops this drifting back the next time someone
adds a third tool.
"""

# #CF2626. The value `annotate_screenshot.py` has always used, and therefore
# the one the 92 annotated images in the September 2026 issue were drawn with.
# Chosen as canonical because changing it would silently invalidate real
# published work, where changing the other only affects images not yet drawn.
HOUSE_RED_HEX = "#CF2626"
HOUSE_RED = (207, 38, 38)

# The caption ink used by screenshot-annotator/annotate_lib.py.
#
# NOT unified with annotate_screenshot.py's INK_NAVY (24, 36, 57) / #182439,
# and that is deliberate rather than an oversight: that file documents its
# value as measured pixel-exact from the reference harness post, so silently
# moving it would edit a measurement to make two numbers match. The red above
# had a clear canonical answer - this does not. Flagged for a human call.
HOUSE_INK_HEX = "#17253C"
HOUSE_INK = (23, 37, 60)


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    v = value.lstrip("#")
    return (int(v[0:2], 16), int(v[2:4], 16), int(v[4:6], 16))


# A constant and its own documentation can disagree too, so this is checked
# here rather than trusted. It costs nothing at import time.
assert hex_to_rgb(HOUSE_RED_HEX) == HOUSE_RED, "HOUSE_RED does not match its hex"
assert hex_to_rgb(HOUSE_INK_HEX) == HOUSE_INK, "HOUSE_INK does not match its hex"
