from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("game_app", "0004_backfill_remaining_game_fields"),
    ]

    operations = [
        migrations.RunSQL(
            sql=[
                "ALTER TABLE game_app_game ALTER COLUMN playtime DROP NOT NULL",
                (
                    "ALTER TABLE game_app_game "
                    "ALTER COLUMN playtime TYPE integer "
                    "USING CASE "
                    "WHEN playtime IS NULL THEN NULL "
                    "ELSE GREATEST(0, FLOOR(EXTRACT(EPOCH FROM playtime) / 3600)::integer) "
                    "END"
                ),
            ],
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
