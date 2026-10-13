#!/usr/bin/env python3
"""Extract German publisher components, without rewriting their text or artwork.

Requires Poppler, Pillow and pdfplumber. Pass a directory containing the PDFs
listed in SOURCES. Originals retain source, PDF page, crop, edition and hashes.
The full PDFs remain external downloads; only component crops ship with the app.
"""
import hashlib
import json
import pathlib
import subprocess
import sys
import tempfile

import pdfplumber
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[1]
PDF_DIR = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/ti4-research-assets")
OUT = ROOT / "src/assets/original"
CDN = "https://asmodee-resources.azureedge.net/media/germanyprod/"
SOURCES = {
    "codex1": {"file": "codex-1-de.pdf", "title": "Codex I · Karten v2", "edition": "Codex I · optional / Ω", "url": CDN + "Regeln/twilight-imperium-4-edition-4015566026131-codex-cards-v2.pdf"},
    "codex2": {"file": "codex-2-de.pdf", "title": "Codex II · Kartenset", "edition": "Codex II · optional", "url": CDN + "Anderer%20Bonuscontent/twilight-imperium-4-edition-4015566026131-twilight-codex-2-kartenset.pdf"},
    "codex3a": {"file": "codex-3-a-de.pdf", "title": "Codex III · Kartenset A v2", "edition": "Codex III · optional / Ω", "url": CDN + "Anderer%20Bonuscontent/Twilight%20Codex%20III%20Kartenset%20A%20%28druckerfreundlich%29_v2.pdf"},
    "codex3b": {"file": "codex-3-b-de.pdf", "title": "Codex III · Kartenset B", "edition": "Codex III · optional", "url": CDN + "Regeln/Twilight%20Codex%20III%20Kartenset%20B%20%28druckerfreundlich%29.pdf"},
    "errata": {"file": "errata-de-20210518.pdf", "title": "Erratierte Komponenten · 18.05.2021", "edition": "Grundspiel + PoK · Errata 2021", "url": CDN + "Anderer%20Bonuscontent/TI4%20%E2%80%93%20Erratierte%20Komponenten%20%E2%80%93%2020210518%20%E2%80%93%20v1.pdf"},
    "base": {"file": "grundspiel-regeln-de.pdf", "title": "Grundspiel · Deutsches Regelheft", "edition": "Grundspiel · Regelheft-Abbildung", "url": CDN + "Produkte/Twillight%20Imperium/Downloads/TWI_IV_Regelheft.pdf"},
}

specs = []
def add(source, page, box, id, title, kind, key=None, rotation=0, note=None, faction=None):
    specs.append(dict(source=source, page=page, crop=box, id=id, title=title,
                      kind=kind, key=key, rotation=rotation, note=note, faction=faction))

factions = {
    7: [("arborec", "Das Arborec"), ("argent", "Die Silberschwingen"), ("vuilraith", "Die Vuil’raith-Verschwörung"), ("muaat", "Die Glut von Muaat"), ("empyrean", "Die Empyrier"), ("creuss", "Die Geister von Creuss")],
    9: [("hacan", "Die Emirate von Hacan"), ("jolnar", "Die Universitäten von Jol-Nar"), ("l1z1x", "Das L1Z1X-Gedankennetz"), ("letnev", "Das Baronat von Letnev"), ("mahact", "Die mahactanischen Gen-Hexer"), ("mentak", "Die Mentak-Koalition")],
    11: [("naalu", "Das Naalu-Kollektiv"), ("naazrokha", "Die Naaz-Rokha-Allianz"), ("nekro", "Das Nekro-Virus"), ("nomad", "Der Nomade"), ("saar", "Der Clan der Zaar"), ("sardakk", "Sardakk N’orr")],
    13: [("sol", "Die Sol-Föderation"), ("titans", "Die Titanen des Ul"), ("winnu", "Die Winnu"), ("xxcha", "Das Xxcha-Königreich"), ("yin", "Die Yin-Bruderschaft"), ("yssaril", "Die Yssaril-Stämme")],
}
for page, fs in factions.items():
    for i, (fid, name) in enumerate(fs):
        x = [33.8, 326.9][i % 2]
        y = 89 + (i // 2) * 218.6667
        add("codex2", page, [x, y, x+251.3, y+176.7], "ref-"+fid, name,
            "Fraktionsreferenz", "ref-"+fid, faction=fid,
            note="Offizielle Kurzreferenz aus Codex II; kein vollständiger Fraktionsbogen. Enthält teilweise Codex-I-Fassungen.")

# Codex I has seventeen unique action cards, twenty physical cards.
action_ids = ["insider-information", "plagiarize", "master-plan", "rally", "scramble-frequency", "forward-supply-base", "fighter-conscription", "blitz", "harness-energy", "hack-election", "reflective-shielding", "impersonation", "solar-flare", "sanction", "counterstroke", "ghost-squad"]
action_titles = ["Insider-Information", "Plagiat", "Masterplan", "Sammeln", "Störfrequenz", "Logistik-Vorposten", "Jäger-Einberufung", "Blitzangriff", "Energienutzung", "Gehackte Wahl", "Reflektierende Schilde", "Verkleidung", "Sonneneruption", "Sanktion", "Gegenschlag", "Phantom-Einheit"]
def grid1(row, col):
    x, y = 50.7+125.3*col, 50.8+186.3*row
    return [x, y, x+117.6, y+180.5]
for i, (id, title) in enumerate(zip(action_ids, action_titles)):
    add("codex1", 1, grid1(i//4, i%4), id, title, "Aktionskarte", "c-aktion-"+id)
add("codex1", 3, grid1(0, 0), "war-machine", "Kriegsmaschinerie", "Aktionskarte", "c-aktion-war-machine", note="Vier Exemplare im Codex-I-Kartenset; eine Abbildung.")
for row, col, id, title in [(1,1,"magmus","Magmus-Reaktor Ω"),(1,2,"wormhole","Wurmloch-Generator Ω"),(1,3,"yinspinner","Yin-Zentrifuge Ω"),(2,2,"letnev-contract","Zuschuss für die Kriegskasse Ω"),(2,3,"yin-contract","Graurand-Mutagen Ω"),(3,1,"arborec-contract","Wachstumshemmer Ω"),(3,2,"winnu-contract","Duldung Ω"),(3,3,"l1z1x-contract","Kybernetische Implantate Ω")]:
    rotation = 270 if row == 1 else 0
    add("codex1", 3, grid1(row,col), id, title, "Technologie" if row==1 else "Vertragskarte", rotation=rotation)
add("codex1", 5, grid1(0,0), "magen-omega", "Magen-Abwehrschirm Ω", "Technologie", rotation=270)
add("codex1", 5, grid1(2,0), "x89-omega", "Bakterieller Kampfstoff X-89 Ω", "Technologie", rotation=270)

def grid3(row, col):
    x, y = 87.8+159*col, 83.4+222*row
    return [x,y,x+118.4,y+181.2]
for row,col,id,title,key in [(0,0,"keleres-tech-0","Basis-Modernisierung","ftech-keleres-0"),(0,1,"keleres-hero-xxcha","Operation Archon · Odlynn Myrr",None),(0,2,"keleres-agent","Xander Alexin Victori III","f-agent-keleres-0"),(1,0,"keleres-mech","Omniopiares","f-mech-keleres"),(1,1,"keleres-hero-mentak","Erwans Pakt · Harka Leeds",None),(1,2,"keleres-commander","Suffi An","f-commander-keleres"),(2,1,"keleres-tech-1","Agenten-Versorgungsnetz","ftech-keleres-1"),(2,2,"keleres-hero-argent","Einsatzkommando Zeta · Kuuasi Aun Jalatai",None)]:
    kind = "Technologie" if "tech" in id else "Vertragskarte" if "contract" in id else "Mech" if "mech" in id else "Anführer"
    add("codex3b",1,grid3(row,col),id,title,kind,key,90,faction="keleres")
add("codex3a",5,grid3(0,0),"keleres-contract","Die Keleres-Klausel","Vertragskarte","f-promissory-keleres",faction="keleres")
add("codex3a",5,grid3(0,1),"custodia-vigilia","Custodia Vigilia","Planet",faction="keleres")
add("codex3a",5,grid3(0,2),"custodia-vigilia-ability","Custodia Vigilia · Legendäre Fähigkeit","Planetenfähigkeit",rotation=90,faction="keleres")
for col,id,title in [(0,"keleres-alliance","Keleres-Allianz"),(1,"naalu-alliance-omega","Naalu-Allianz Ω"),(2,"yin-alliance-omega","Yin-Allianz Ω")]:
    add("codex3a",5,grid3(1,col),id,title,"Allianzreferenz",rotation=90)
add("codex3a",7,[99,27,909,585],"keleres-front","Die Keleres des Rates · Vorderseite","Fraktionsbogen","fs-keleres-front",faction="keleres")
add("codex3a",8,[99,27,909,585],"keleres-back","Die Keleres des Rates · Rückseite","Fraktionsbogen","fs-keleres-back",180,faction="keleres")
for row,col,id,title in [(0,2,"naalu-agent-omega","Z’eu Ω"),(1,2,"naalu-commander-omega","M’aban Ω"),(2,2,"naalu-mech-omega","Ikonoklast Ω"),(0,1,"yin-agent-omega","Bruder Milor Ω"),(1,1,"yin-commander-omega","Bruder Omar Ω"),(2,1,"yin-hero-omega","Quantenstreuung Ω"),(0,0,"xxcha-hero-omega","Politischer Datennexus Ω")]:
    add("codex3a",1,grid3(row,col),id,title,"Mech" if "mech" in id else "Anführer",rotation=90)
for col,id,title,key in [(0,"fight-precision","Kämpfe mit Präzision","c-auftrag-fight-with-precision"),(1,"destroy-fleets","Vernichte ihre Flotten","c-auftrag-turn-their-fleets-to-dust"),(2,"make-example","Statuiere ein Exempel","c-auftrag-make-an-example-of-their-world")]:
    add("codex3a",3,grid3(0,col),id,title,"Auftrag",key,note="Deutsche Ersatzkarte aus Codex III; korrigiert die falsche Sprache im ersten deutschen PoK-Druck. Keine zusätzliche Auftragskarte.")
    specs[-1]["edition"] = "Grundspiel + PoK · deutsche Ersatzkarte aus Codex III"

# Errata apply to the base + PoK game, unlike optional Omega replacements.
for y,id,title,key,kind in [(156.2,"winnu-tech-errata","Hegemoniale Handelsstrategie","ftech-winnu-1","Technologie"),(315.2,"jolnar-tech-errata","E-Res-Extraktor","ftech-jolnar-0","Technologie"),(474.2,"mahact-commander-errata","Il Na Viroset","f-commander-mahact","Anführer")]:
    add("errata",1,[66,y,246.5,y+117.3],id,title,kind,key)
add("errata",1,[306.8,148.5,549.9,445.9],"diplomacy-errata","Diplomatie · Primär- und Sekundärfähigkeit","Strategiekarte","strategy-diplomacy")
add("errata",2,[348.5,474.2,529,591.5],"mahact-commander-back","Il Na Viroset · Freischalten","Anführer",note="Rückseite mit Freischaltbedingung: 2 Kommandomarker anderer Spieler im Flottenpool.")
add("base",6,[314,179,544,335],"xxcha-front","Das Xxcha-Königreich · Vorderseite","Fraktionsbogen","fs-xxcha-front",note="Deutsche Illustration im Regelheft mit begrenzter Auflösung. Der englische Bogen in hoher Auflösung und die deutsche Textfassung sind zusätzlich verfügbar.",faction="xxcha")

# Alliance cards and additional relics from Codex II.
alliance_names = {
    1:["Arborec-Allianz","Silberschwingen-Allianz","Vuil’raith-Allianz","Empyrier-Allianz","Creuss-Allianz","Hacan-Allianz","Jol-Nar-Allianz","L1Z1X-Allianz","Letnev-Allianz"],
    3:["Mentak-Allianz","Naalu-Allianz","Naaz-Rokha-Allianz","Nekro-Allianz","Allianz mit dem Nomaden","Zaar-Allianz","N’orr-Allianz","Sol-Allianz","Ul-Allianz"],
    5:["Winnu-Allianz","Xxcha-Allianz","Yin-Allianz","Yssaril-Allianz","Mahactaner-Allianz","Muaat-Allianz","JR-XS455-O","Nano-Schmiede","Dynamis-Kern"]}
for page,names in alliance_names.items():
    for i,name in enumerate(names):
        relic = page==5 and i>=7
        agent = page==5 and i==6
        add("codex2",page,grid3(i//3,i%3),"codex2-p%d-%d"%(page,i),name,"Relikt" if relic else "Anführer" if agent else "Allianzreferenz",rotation=0 if relic else 90,
            note="Zusätzliches Relikt aus Codex II; gehört nicht zum PoK-Boxstapel." if relic else "Zusätzlicher Agent aus Codex II." if agent else "Allianz-Referenzkarte aus Codex II; kein Scan der farbigen Vertragskarte aus der PoK-Box.")

related = {"magmus":"ftech-muaat-1", "wormhole":"ftech-creuss-1", "yinspinner":"ftech-yin-0",
           "magen-omega":"tech-magen-defense-grid", "x89-omega":"tech-x-89-bacterial-weapon",
           "letnev-contract":"f-promissory-letnev", "yin-contract":"f-promissory-yin", "arborec-contract":"f-promissory-arborec",
           "winnu-contract":"f-promissory-winnu", "l1z1x-contract":"f-promissory-l1z1x",
           "naalu-agent-omega":"f-agent-naalu-0", "naalu-commander-omega":"f-commander-naalu", "naalu-mech-omega":"f-mech-naalu",
           "yin-agent-omega":"f-agent-yin-0", "yin-commander-omega":"f-commander-yin", "yin-hero-omega":"f-hero-yin", "xxcha-hero-omega":"f-hero-xxcha"}
for spec in specs:
    if spec["id"] in related:
        spec["relatedKey"] = related[spec["id"]]

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    for old in OUT.glob("*.webp"):
        old.unlink()
    sources = {}
    for id, s in SOURCES.items():
        sources[id] = dict(s, sha256=hashlib.sha256((PDF_DIR/s["file"]).read_bytes()).hexdigest(), publisher="Fantasy Flight Games / Asmodee Deutschland", language="de")
    assets = []
    with tempfile.TemporaryDirectory() as tmp:
        rendered = {}
        for s in specs:
            pair = (s["source"],s["page"])
            if pair not in rendered:
                pdf = PDF_DIR/SOURCES[s["source"]]["file"]
                target = pathlib.Path(tmp)/("%s-%s"%pair)
                subprocess.run(["pdftoppm","-f",str(s["page"]),"-l",str(s["page"]),"-r","200","-singlefile","-png",str(pdf),str(target)],check=True,stdout=subprocess.DEVNULL)
                with pdfplumber.open(pdf) as p:
                    page = p.pages[s["page"]-1]
                    rendered[pair] = (Image.open(str(target)+".png").convert("RGB"), page.width,page.height)
            page,w,h = rendered[pair]
            sx,sy = page.width/w,page.height/h
            crop = page.crop(tuple(round(v*(sx if i%2==0 else sy)) for i,v in enumerate(s["crop"])))
            if s["rotation"]:
                crop = crop.rotate(s["rotation"],expand=True)
            dest = OUT/(s["id"]+".webp")
            crop.save(dest,"WEBP",quality=92,method=6)
            item = dict(s,src="assets/original/"+dest.name,width=crop.width,height=crop.height,
                        sha256=hashlib.sha256(dest.read_bytes()).hexdigest(),status="original",language="de",edition=s.get("edition",sources[s["source"]]["edition"]))
            if s["source"] == "codex1":
                item["edition"] = "Codex I · optionale Zusatzkarte" if s["kind"] == "Aktionskarte" else "Codex I · optionale Ω-Fassung"
            if s["faction"] == "keleres":
                item["edition"] = "Codex III · optionale Fraktion Keleres"
            if s["source"] == "codex3a" and "Ω" in s["title"]:
                item["edition"] = "Codex III · optionale Ω-Fassung"
            assets.append(item)
            if s["kind"]=="Fraktionsreferenz":
                # The portrait is a crop of the same publisher reference, never invented art.
                portrait = page.crop(tuple(round(v*(sx if i%2==0 else sy)) for i,v in enumerate([s["crop"][0],s["crop"][1],s["crop"][0]+58,s["crop"][1]+65])))
                portrait.save(OUT/(s["faction"]+"-portrait.webp"),"WEBP",quality=90)
        data = {"sources":sources,"items":assets,"reviewedOn":"2026-10-13","rights":"© Fantasy Flight Games / Asmodee. Originalmaterial aus den öffentlich angebotenen deutschen Downloads; keine freie Lizenz behauptet."}
        (ROOT/"src/data/original-assets.js").write_text("/* German publisher component crops. Generated by scripts/import_original_assets.py. */\nwindow.TI4 = window.TI4 || {};\nTI4.originalAssets = "+json.dumps(data,ensure_ascii=False,separators=(",",":"))+";\n",encoding="utf-8")
        (ROOT/"src/assets/original/manifest.json").write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("Imported",len(assets),"German original components.")

if __name__ == "__main__":
    main()
