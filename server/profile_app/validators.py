import json

def validate_genre_tags(genre_tags):
    if not isinstance(genre_tags, list):
        raise ValueError("Genre tags must be a list.")
    for tag in genre_tags:
        if not isinstance(tag, str):
            raise ValueError("Each genre tag must be a string.")
    return genre_tags