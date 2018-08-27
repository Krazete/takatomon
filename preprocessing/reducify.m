% for preprocessing/img/mon and preprocessing/img/hina
% change subdir and rerun as necessary

imdir = '/Users/Krazete/Desktop/takatomon/preprocessing/img/';
reimdir = '/Users/Krazete/Desktop/takatomon/img/';
subdir = 'awkn/0';

colors = 64;
dith = 'nodither';

mkdir([reimdir, subdir]);
cd([imdir, subdir]);

files = dir;
N = length(files);
for n = 1:N
    file = files(n);
    if contains(file.name, '.png')
        [im, map] = imread(file.name);
        if size(map) > 0
            [reim, remap] = imapprox(im, map, colors, dith);
        else
            [reim, remap] = rgb2ind(im, colors, dith);
        end
        rename = [reimdir, subdir, '/', file.name];
        imwrite(reim, remap, rename);
        % add transparency for subdirs 'mon' and 'hina/*'
%         imwrite(reim, remap, rename, 'Transparency', 0);
    end
end

cd(reimdir);
