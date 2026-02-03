import os

def parse_photos(folder_path):
    file_contents = []
    for filename in os.listdir(folder_path):
        if filename.endswith(".png"):
            file_path = os.path.join(folder_path, filename).replace("\\", "/")
            file_contents.append(file_path)
            
    file_txt = ""
    for link in file_contents:
        html_stub = f'<div class="item"><img src="https://cyberherdit.github.io/cyberherd-public-assets/{link}" alt="{os.path.basename(link)}" style="width:100%;"></div>'
        file_txt += html_stub + "\n"

    output_path = os.path.join(folder_path, "photos.txt").replace("\\", "/")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(file_txt)

    file_txt = "<li data-target=\"#myCarousel\" data-slide-to=\"0\" class=\"active\"></li>" + "\n"
    for i, link in enumerate(file_contents):
        if i == 0:
            continue
        file_txt += f"<li data-target=\"#myCarousel\" data-slide-to=\"{i}\"></li>\n"
    output_path = os.path.join(folder_path, "indicators.txt").replace("\\", "/")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(file_txt)