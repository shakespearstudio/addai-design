STYLE_PREFIX = {
    "modern_minimalist": "contemporary workplace interior design, warm white oak wood and matte black steel palette, biophilic elements with indoor plants, soft diffused natural lighting through floor-to-ceiling windows",
    "high_tech": "tech campus office interior, glass partitions with frosted film, architectural accent lighting, exposed concrete ceiling with cable management, dynamic spatial layers and open collaboration zones",
    "boutique": "boutique hospitality-influenced office interior, curated luxury materials, art-forward wall treatments, bespoke custom furniture, intimate human-scale spaces with warm ambient lighting",
}

ANGLE_CONTEXT = {
    "reception": "main reception lobby viewed from main entrance, showing welcome desk, brand wall signage, and waiting lounge area with signature lighting fixture",
    "open_office": "open plan workstation area viewed from above-eye level, showing ergonomic workstations in clusters, glass-walled collaboration pods, and natural light flooding the space",
    "key_feature_zone": "the most architecturally distinctive zone in the office, showing the signature design move with maximum spatial drama and material richness",
}

ANGLE_LABELS = {
    "reception": "前厅接待区",
    "open_office": "开放办公区",
    "key_feature_zone": "核心特色空间",
}


def build_render_prompt(style: str, angle: str, render_description: str) -> str:
    return (
        f"{STYLE_PREFIX.get(style, STYLE_PREFIX['modern_minimalist'])}, "
        f"{ANGLE_CONTEXT[angle]}, "
        f"{render_description}, "
        f"architectural interior visualization, photorealistic rendering, high resolution, "
        f"natural daylight with supplementary warm ambient lighting, "
        f"high-end commercial interior design, premium materials and finishes, "
        f"eye level perspective with slight elevation, wide angle lens, subtle depth of field, "
        f"no people, pristine showroom condition, professional architectural photography"
    )
