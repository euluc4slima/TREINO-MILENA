# Vídeos locais dos exercícios

Coloque aqui arquivos **MP4** para que a demonstração funcione sem internet. O nome do arquivo liga o vídeo ao exercício.

Nenhum vídeo acompanha o projeto: use apenas material próprio ou com autorização. Não baixe nem redistribua vídeos de terceiros.

| Exercício | Arquivo |
|---|---|
| Agachamento no Smith | `agachamento-smith.mp4` |
| Leg press 45° | `leg-press.mp4` |
| Cadeira extensora | `cadeira-extensora.mp4` |
| Elevação pélvica | `elevacao-pelvica.mp4` |
| Cadeira abdutora | `cadeira-abdutora.mp4` |
| Panturrilha sentada | `panturrilha-sentada.mp4` |
| Puxada frontal | `puxada-frontal.mp4` |
| Remada baixa | `remada-baixa.mp4` |
| Desenvolvimento com halteres | `desenvolvimento-halteres.mp4` |
| Elevação lateral | `elevacao-lateral.mp4` |
| Rosca direta | `rosca-direta.mp4` |
| Rosca martelo | `rosca-martelo.mp4` |
| Stiff com halteres | `stiff-halteres.mp4` |
| Mesa flexora | `mesa-flexora.mp4` |
| Afundo com halteres | `afundo-halteres.mp4` |
| Coice na polia | `coice-polia.mp4` |
| Supino com halteres | `supino-halteres.mp4` |
| Remada unilateral | `remada-unilateral.mp4` |
| Crucifixo na máquina | `crucifixo-maquina.mp4` |
| Tríceps na polia | `triceps-polia.mp4` |
| Face pull | `face-pull.mp4` |

Para exercícios criados por você, defina o nome do arquivo no formulário do exercício (campo "Arquivo de vídeo local").

## Como comprimir (recomendado: até ~3 MB por vídeo)

Com o ffmpeg instalado:

```bash
ffmpeg -i original.mov -vf "scale=-2:720" -c:v libx264 -crf 28 -preset slow -an -movflags +faststart agachamento-smith.mp4
```

Vídeo vertical, 10–20 segundos, sem áudio, H.264 (formato que o iPhone reproduz).

Depois de adicionar arquivos, rode `npm run build` e publique de novo. O app guarda os vídeos no aparelho na primeira abertura com internet e mostra o selo "Disponível offline".
