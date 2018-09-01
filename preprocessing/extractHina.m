% run in 'preprocessing' directory

[im, map, alpha] = imread('img/hina.png');
w = 320;
h = 640;
gap = 10;

indexify_option = false;

clothes = {'default', 'winter', 'kimono'};
tribes = {'abyss', 'electric', 'glacier', 'mirage', 'bright', 'earth', 'blazing', 'almond'};

mkdir('../img/hina/');
for y = 1:3
    mkdir(sprintf('../img/hina/%s', clothes{y}));
    for x = 1:8
        name = sprintf('../img/hina/%s/%s.png', clothes{y}, tribes{x});
        ya = (h + gap) * (y - 1) + gap + 1;
        xa = (w + gap) * (x - 1) + gap + 1;
        yb = (h + gap) * y;
        xb = (w + gap) * x;
        if indexify_option
            [hina, map] = rgb2ind(im(ya:yb, xa:xb, :), 64, 'nodither');
            imwrite(hina, map, name, 'Transparency', 0);
        else
            imwrite(im(ya:yb, xa:xb, :), name, 'Alpha', alpha(ya:yb, xa:xb));
        end
    end
end
